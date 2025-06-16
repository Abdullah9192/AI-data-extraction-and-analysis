const { Document } = require('../models');
const pdf = require('pdf-parse');
const fs = require('fs').promises;
const geminiService = require('./geminiService');

async function processDocument(documentId, filePath) {
    try {
        console.log('Starting document processing:', { documentId, filePath });
        
        const document = await Document.findByPk(documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        console.log('Document found:', {
            id: document.id,
            filename: document.filename,
            mimeType: document.metadata.mimeType
        });

        // Update status to processing
        await document.update({
            status: 'processing',
            currentStage: 'extracting',
            progress: 10
        });

        // Extract text based on file type
        let extractedText;
        try {
            if (document.metadata.mimeType === 'application/pdf') {
                console.log('Processing PDF file');
                const dataBuffer = await fs.readFile(filePath);
                const pdfData = await pdf(dataBuffer);
                extractedText = pdfData.text;
            } else if (document.metadata.mimeType === 'text/plain') {
                console.log('Processing TXT file');
                extractedText = await fs.readFile(filePath, 'utf-8');
            } else {
                throw new Error(`Unsupported file type: ${document.metadata.mimeType}`);
            }
            console.log('Text extraction completed, length:', extractedText.length);
        } catch (error) {
            console.error('Error extracting text:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw new Error(`Failed to extract text: ${error.message}`);
        }

        // Update status to preparing
        await document.update({
            status: 'processing',
            currentStage: 'preparing',
            progress: 50,
            extractedText
        });

        // Generate insights using Gemini
        console.log('Generating insights with Gemini');
        try {
            const insights = await geminiService.generateInsights(extractedText);
            console.log('Insights generated successfully');

            // Update document with insights
            await document.update({
                status: 'ready',
                currentStage: 'complete',
                progress: 100,
                insights: insights.insights,
                metadata: {
                    ...document.metadata,
                    analysisDate: new Date().toISOString(),
                    model: insights.metadata.model
                }
            });

            console.log('Document processing completed successfully');
            return document;
        } catch (error) {
            console.error('Error generating insights:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw new Error(`Failed to generate insights: ${error.message}`);
        }
    } catch (error) {
        console.error('Error processing document:', {
            documentId,
            error: {
                message: error.message,
                stack: error.stack,
                name: error.name
            }
        });
        
        try {
            await Document.update(
                {
                    status: 'error',
                    currentStage: 'error',
                    error: error.message
                },
                { where: { id: documentId } }
            );
        } catch (updateError) {
            console.error('Failed to update document status:', {
                message: updateError.message,
                stack: updateError.stack,
                name: updateError.name
            });
        }
        
        throw error;
    }
}

module.exports = {
    processDocument
}; 