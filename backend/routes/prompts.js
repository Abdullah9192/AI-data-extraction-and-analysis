const express = require('express');
const router = express.Router();
const PromptTemplate = require('../models/PromptTemplate');

// Get all prompt templates
router.get('/', async (req, res) => {
  try {
    const prompts = await PromptTemplate.find({ isPublic: true });
    res.json(prompts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt templates' });
  }
});

// Create new prompt template
router.post('/', async (req, res) => {
  try {
    const promptTemplate = new PromptTemplate(req.body);
    await promptTemplate.save();
    res.status(201).json(promptTemplate);
  } catch (error) {
    res.status(400).json({ message: 'Error creating prompt template' });
  }
});

// Get prompt template by ID
router.get('/:id', async (req, res) => {
  try {
    const prompt = await PromptTemplate.findById(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt template' });
  }
});

// Update prompt template
router.put('/:id', async (req, res) => {
  try {
    const prompt = await PromptTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    res.json(prompt);
  } catch (error) {
    res.status(400).json({ message: 'Error updating prompt template' });
  }
});

// Delete prompt template
router.delete('/:id', async (req, res) => {
  try {
    const prompt = await PromptTemplate.findByIdAndDelete(req.params.id);
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    res.json({ message: 'Prompt template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt template' });
  }
});

// Initialize default prompt templates
router.post('/initialize', async (req, res) => {
  try {
    const defaultPrompts = [
      {
        name: 'Executive Summary',
        category: 'summary',
        promptText: 'Provide a concise executive summary of the following document in 3-5 bullet points: {document_content}',
        variables: [{ name: 'document_content', required: true }]
      },
      {
        name: 'Key Insights',
        category: 'analysis',
        promptText: 'Analyze this document and extract the 5 most important insights: {document_content}',
        variables: [{ name: 'document_content', required: true }]
      },
      {
        name: 'Action Items',
        category: 'extraction',
        promptText: 'List all action items, tasks, or next steps mentioned in this document: {document_content}',
        variables: [{ name: 'document_content', required: true }]
      },
      {
        name: 'Financial Figures',
        category: 'extraction',
        promptText: 'Extract all financial figures, amounts, and percentages from this document: {document_content}',
        variables: [{ name: 'document_content', required: true }]
      }
    ];

    await PromptTemplate.insertMany(defaultPrompts);
    res.status(201).json({ message: 'Default prompt templates initialized' });
  } catch (error) {
    res.status(500).json({ message: 'Error initializing default prompt templates' });
  }
});

module.exports = router; 