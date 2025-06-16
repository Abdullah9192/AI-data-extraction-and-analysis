const { Analysis, Document } = require('../models');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeDocument = async (analysisId) => {
  try {
    // Get analysis record
    const analysis = await Analysis.findByPk(analysisId, {
      include: [
        { model: Document, attributes: ['extractedText'] }
      ]
    });

    if (!analysis) {
      throw new Error('Analysis not found');
    }

    // Get the document text
    const documentText = analysis.Document.extractedText;
    if (!documentText) {
      throw new Error('No text content found in document');
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Start timing
    const startTime = Date.now();

    // Generate response
    const result = await model.generateContent(analysis.finalPrompt);
    const response = await result.response;
    const text = response.text();

    // Calculate execution time
    const executionTimeMs = Date.now() - startTime;

    // Update analysis with results
    await analysis.update({
      geminiResponse: text,
      responseMetadata: {
        model: "gemini-pro",
        executionTimeMs
      },
      executionTimeMs
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    // Update analysis with error
    await Analysis.update(
      {
        errorMessage: error.message
      },
      { where: { id: analysisId } }
    );
  }
};

module.exports = {
  analyzeDocument
}; 