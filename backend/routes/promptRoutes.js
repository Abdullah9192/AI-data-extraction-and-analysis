const express = require('express');
const router = express.Router();
const { PromptTemplate } = require('../models');

// Create a new prompt template
router.post('/', async (req, res) => {
  try {
    const promptTemplate = await PromptTemplate.create(req.body);
    res.status(201).json(promptTemplate);
  } catch (error) {
    res.status(500).json({ message: 'Error creating prompt template' });
  }
});

// Get all prompt templates
router.get('/', async (req, res) => {
  try {
    const promptTemplates = await PromptTemplate.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(promptTemplates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt templates' });
  }
});

// Get a specific prompt template
router.get('/:id', async (req, res) => {
  try {
    const promptTemplate = await PromptTemplate.findByPk(req.params.id);
    if (!promptTemplate) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    res.json(promptTemplate);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching prompt template' });
  }
});

// Update a prompt template
router.put('/:id', async (req, res) => {
  try {
    const promptTemplate = await PromptTemplate.findByPk(req.params.id);
    if (!promptTemplate) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    await promptTemplate.update(req.body);
    res.json(promptTemplate);
  } catch (error) {
    res.status(500).json({ message: 'Error updating prompt template' });
  }
});

// Delete a prompt template
router.delete('/:id', async (req, res) => {
  try {
    const promptTemplate = await PromptTemplate.findByPk(req.params.id);
    if (!promptTemplate) {
      return res.status(404).json({ message: 'Prompt template not found' });
    }
    await promptTemplate.destroy();
    res.json({ message: 'Prompt template deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting prompt template' });
  }
});

module.exports = router; 