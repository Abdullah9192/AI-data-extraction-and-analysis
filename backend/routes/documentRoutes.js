const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document } = require('../models');
const { processDocument } = require('../services/documentProcessor');
const documentProcessingService = require('../services/documentProcessingService');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
console.log('Upload directory:', uploadDir);

if (!fs.existsSync(uploadDir)) {
    console.log('Creating uploads directory');
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('Multer destination called with file:', file.originalname);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `${Date.now()}-${file.originalname}`;
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        console.log('Multer fileFilter called with:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
            console.log('File type accepted');
            cb(null, true);
        } else {
            console.log('File type rejected:', file.mimetype);
            cb(new Error('Only PDF and TXT files are allowed'));
        }
    }
});

// Error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('Route error:', {
            path: req.path,
            method: req.method,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        });
        res.status(500).json({ 
            error: 'Error processing request',
            message: error.message 
        });
    });
};

// Upload document
router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
    console.log('Upload route called');
    
    if (!req.file) {
        console.log('No file received in request');
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File received:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
    });

    try {
        console.log('Creating document record');
        const document = await Document.create({
            filename: req.file.filename,
            originalName: req.file.originalname,
            fileSize: req.file.size,
            status: 'uploaded',
            currentStage: 'upload',
            progress: 0,
            metadata: {
                uploadDate: new Date().toISOString(),
                mimeType: req.file.mimetype
            }
        });

        console.log('Document created:', document.toJSON());

        // Start processing in background
        console.log('Starting document processing');
        processDocument(document.id, req.file.path)
            .catch(error => {
                console.error('Error processing document:', {
                    documentId: document.id,
                    error: {
                        message: error.message,
                        stack: error.stack,
                        name: error.name
                    }
                });
                
                return Document.update(
                    { 
                        status: 'error',
                        currentStage: 'error',
                        error: error.message
                    },
                    { where: { id: document.id } }
                );
            });

        console.log('Sending response');
        res.status(201).json(document);
    } catch (error) {
        console.error('Error in upload route:', {
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        });
        throw error; // This will be caught by asyncHandler
    }
}));

// Get document status
router.get('/:id/status', asyncHandler(async (req, res) => {
    console.log('Status route called for document:', req.params.id);
    const document = await Document.findByPk(req.params.id);
    if (!document) {
        return res.status(404).json({ error: 'Document not found' });
    }
    res.json({
        status: document.status,
        currentStage: document.currentStage,
        progress: document.progress
    });
}));

// Get document details
router.get('/:id', asyncHandler(async (req, res) => {
    console.log('Get document route called for:', req.params.id);
    const document = await Document.findByPk(req.params.id);
    if (!document) {
        return res.status(404).json({ error: 'Document not found' });
    }
    res.json(document);
}));

// List all documents
router.get('/', async (req, res) => {
  try {
    const documents = await Document.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('List documents error:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Ask a question about the document
router.post('/:id/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!document.extractedText) {
      return res.status(400).json({ error: 'Document text not extracted yet' });
    }

    const answer = await documentProcessingService.answerQuestion(req.params.id, question);
    res.json(answer);
  } catch (error) {
    console.error('Error answering question:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

module.exports = router; 