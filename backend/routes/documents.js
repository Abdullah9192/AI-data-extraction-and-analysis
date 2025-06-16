const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const geminiService = require('../services/geminiService');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and TXT files are allowed'));
    }
  }
});

// Upload document
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = new Document({
      filename: req.file.originalname,
      fileSize: req.file.size,
      status: 'uploaded',
      currentStage: 'uploaded'
    });

    await document.save();

    // Start processing in background
    processDocument(document._id, req.file.path);

    res.status(201).json({
      message: 'File uploaded successfully',
      documentId: document._id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file' });
  }
});

// Get document status
router.get('/:id/status', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({
      status: document.status,
      currentStage: document.currentStage,
      progress: document.progress
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document status' });
  }
});

// Get document content
router.get('/:id/content', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({
      extractedText: document.extractedText,
      textLength: document.textLength
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document content' });
  }
});

// Ask a question about the document
router.post('/:id/ask', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ message: 'Document text not extracted yet' });
    }

    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const answer = await geminiService.answerQuestion(document.extractedText, question);
    res.json(answer);
  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({ message: 'Error processing question' });
  }
});

// Get document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(document);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Error fetching document' });
  }
});

// Helper function to process document
async function processDocument(documentId, filePath) {
  try {
    const document = await Document.findById(documentId);
    if (!document) return;

    // Stage 1: Extracting text
    document.status = 'extracting';
    document.currentStage = 'Extracting text';
    document.progress = 25;
    await document.save();

    let text = '';
    if (path.extname(filePath).toLowerCase() === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      text = data.text;
    } else {
      text = fs.readFileSync(filePath, 'utf8');
    }

    // Stage 2: Preparing for analysis
    document.status = 'preparing';
    document.currentStage = 'Preparing for analysis';
    document.progress = 50;
    await document.save();

    // Stage 3: Ready for analysis
    document.status = 'ready';
    document.currentStage = 'Ready for AI analysis';
    document.progress = 100;
    document.extractedText = text;
    document.textLength = text.length;
    await document.save();

    // Clean up uploaded file
    fs.unlinkSync(filePath);
  } catch (error) {
    console.error('Processing error:', error);
    const document = await Document.findById(documentId);
    if (document) {
      document.status = 'error';
      document.currentStage = 'Error processing document';
      await document.save();
    }
  }
}

module.exports = router; 