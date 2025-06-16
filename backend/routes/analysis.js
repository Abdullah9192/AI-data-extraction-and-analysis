const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const redis = require('redis');
const Analysis = require('../models/Analysis');
const Document = require('../models/Document');
const PromptTemplate = require('../models/PromptTemplate');

// Initialize Redis client
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.connect().catch(console.error);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Analyze document with prompt
router.post('/analyze', async (req, res) => {
  try {
    const { documentId, promptTemplateId, customPrompt } = req.body;

    // Get document and prompt template
    const [document, promptTemplate] = await Promise.all([
      Document.findById(documentId),
      PromptTemplate.findById(promptTemplateId)
    ]);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!promptTemplate && !customPrompt) {
      return res.status(400).json({ message: 'No prompt template or custom prompt provided' });
    }

    // Check if document is ready for analysis
    if (document.status !== 'ready') {
      return res.status(400).json({ message: 'Document is not ready for analysis' });
    }

    // Prepare the prompt
    const finalPrompt = customPrompt || promptTemplate.promptText.replace(
      '{document_content}',
      document.extractedText
    );

    // Check cache
    const cacheKey = `analysis:${documentId}:${finalPrompt}`;
    const cachedResult = await redisClient.get(cacheKey);
    if (cachedResult) {
      return res.json(JSON.parse(cachedResult));
    }

    // Create analysis record
    const analysis = new Analysis({
      documentId,
      promptTemplateId,
      finalPrompt
    });

    // Get AI response
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const startTime = Date.now();
    
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    // Update analysis record
    analysis.geminiResponse = text;
    analysis.responseMetadata = {
      model: 'gemini-pro',
      temperature: 0.7
    };
    analysis.executionTimeMs = Date.now() - startTime;
    await analysis.save();

    // Update prompt template usage count
    if (promptTemplate) {
      promptTemplate.usageCount += 1;
      await promptTemplate.save();
    }

    // Cache the result
    const responseData = {
      analysisId: analysis._id,
      response: text,
      metadata: analysis.responseMetadata,
      executionTime: analysis.executionTimeMs
    };
    await redisClient.set(cacheKey, JSON.stringify(responseData), {
      EX: 3600 // Cache for 1 hour
    });

    res.json(responseData);
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ message: 'Error analyzing document' });
  }
});

// Get analysis history for a document
router.get('/document/:documentId', async (req, res) => {
  try {
    const analyses = await Analysis.find({ documentId: req.params.documentId })
      .populate('promptTemplateId')
      .sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis history' });
  }
});

// Get specific analysis
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('promptTemplateId');
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis' });
  }
});

module.exports = router; 