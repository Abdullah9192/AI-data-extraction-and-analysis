const fs = require('fs').promises;
const path = require('path');
const { Document } = require('../models');
const geminiService = require('./geminiService');
const { extractTextFromPDF } = require('../utils/pdfUtils');

class DocumentProcessingService {
    async processDocument(documentId) {
        try {
            const document = await Document.findByPk(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            // Update status to extracting
            await document.update({ status: 'extracting' });

            // Extract text from PDF
            const filePath = path.join(__dirname, '..', 'uploads', document.filename);
            const extractedText = await extractTextFromPDF(filePath);

            // Update status to preparing
            await document.update({ 
                status: 'preparing',
                extractedText: extractedText
            });

            // Generate insights using Gemini
            const insights = await geminiService.generateInsights(extractedText);

            // Update document with insights and mark as ready
            await document.update({
                status: 'ready',
                insights: insights.insights,
                metadata: {
                    ...document.metadata,
                    analysisMetadata: insights.metadata
                }
            });

            return document;
        } catch (error) {
            console.error('Error processing document:', error);
            await Document.update(
                { 
                    status: 'error',
                    error: error.message
                },
                { where: { id: documentId } }
            );
            throw error;
        }
    }

    async analyzeWithPrompt(documentId, promptTemplateId, customPrompt) {
        try {
            const document = await Document.findByPk(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            if (!document.extractedText) {
                throw new Error('Document text not extracted yet');
            }

            // Use Gemini to analyze the text with the prompt
            const analysis = await geminiService.analyzeText(
                document.extractedText,
                customPrompt || promptTemplateId
            );

            return {
                documentId,
                promptTemplateId,
                result: analysis.text,
                metadata: {
                    ...analysis.metadata,
                    documentMetadata: document.metadata
                }
            };
        } catch (error) {
            console.error('Error in prompt analysis:', error);
            throw error;
        }
    }

    async answerQuestion(documentId, question) {
        try {
            const document = await Document.findByPk(documentId);
            if (!document) {
                throw new Error('Document not found');
            }

            if (!document.extractedText) {
                throw new Error('Document text not extracted yet');
            }

            // Use Gemini to answer the question
            const answer = await geminiService.answerQuestion(
                document.extractedText,
                question
            );

            return {
                documentId,
                question,
                answer: answer.answer,
                metadata: answer.metadata
            };
        } catch (error) {
            console.error('Error answering question:', error);
            throw error;
        }
    }
}

module.exports = new DocumentProcessingService(); 