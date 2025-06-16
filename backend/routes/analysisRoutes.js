const express = require('express');
const router = express.Router();
const { Analysis, Document, PromptTemplate } = require('../models');
const { analyzeDocument } = require('../services/analysisService');

// Create a new analysis
router.post('/', async (req, res) => {
  try {
    const { documentId, promptTemplateId, finalPrompt } = req.body;

    // Verify document and prompt template exist
    const [document, promptTemplate] = await Promise.all([
      Document.findByPk(documentId),
      PromptTemplate.findByPk(promptTemplateId)
    ]);

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    if (!promptTemplate) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }

    // Create analysis record
    const analysis = await Analysis.create({
      documentId,
      promptTemplateId,
      finalPrompt,
      status: 'processing'
    });

    // Start analysis in background
    analyzeDocument(analysis.id);

    res.status(201).json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error creating analysis' });
  }
});

// Get all analyses
router.get('/', async (req, res) => {
  try {
    const analyses = await Analysis.findAll({
      include: [
        { model: Document, attributes: ['filename', 'status'] },
        { model: PromptTemplate, attributes: ['name', 'category'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analyses' });
  }
});

// Get a specific analysis
router.get('/:id', async (req, res) => {
  try {
    const analysis = await Analysis.findByPk(req.params.id, {
      include: [
        { model: Document, attributes: ['filename', 'status'] },
        { model: PromptTemplate, attributes: ['name', 'category'] }
      ]
    });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analysis' });
  }
});

// Get analyses for a specific document
router.get('/document/:documentId', async (req, res) => {
  try {
    const analyses = await Analysis.findAll({
      where: { documentId: req.params.documentId },
      include: [
        { model: PromptTemplate, attributes: ['name', 'category'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document analyses' });
  }
});

module.exports = router; 