const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class GeminiService {
    constructor() {
        // Hardcode the API key for testing
        const apiKey = 'AIzaSyByM_NP2_XuJZu7JcfNMuGM3yW4bS5zR7U';
        
        try {
            console.log('Initializing Gemini service with API key:', apiKey.substring(0, 10) + '...');
            this.genAI = new GoogleGenerativeAI(apiKey);
            
            // Use gemini-2.0-flash as shown in the example
            this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            console.log('Gemini service initialized successfully with model: gemini-2.0-flash');
        } catch (error) {
            console.error('Error initializing Gemini:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            throw error;
        }
    }

    async analyzeText(text, prompt) {
        try {
            console.log('Starting text analysis with Gemini');
            console.log('Text length:', text.length);
            console.log('Prompt:', prompt);
            
            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: `${prompt}\n\n${text}`
                    }]
                }]
            });
            const response = await result.response;
            console.log('Analysis completed successfully');
            
            return {
                text: response.text(),
                metadata: {
                    model: "gemini-2.0-flash",
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error in Gemini analysis:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                details: error.details || 'No additional details'
            });
            throw new Error(`Gemini analysis failed: ${error.message}`);
        }
    }

    async generateInsights(text) {
        try {
            console.log('Starting insights generation with Gemini');
            console.log('Text length:', text.length);
            
            const prompt = `Analyze the following text and provide key insights, main points, and any notable patterns or trends. Format the response in a structured way with clear sections.`;
            console.log('Using prompt:', prompt);
            
            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: `${prompt}\n\n${text}`
                    }]
                }]
            });
            const response = await result.response;
            console.log('Insights generated successfully');
            
            return {
                insights: response.text(),
                metadata: {
                    model: "gemini-2.0-flash",
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error generating insights:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                details: error.details || 'No additional details'
            });
            throw new Error(`Failed to generate insights: ${error.message}`);
        }
    }

    async answerQuestion(text, question) {
        try {
            console.log('Starting question answering with Gemini');
            console.log('Text length:', text.length);
            console.log('Question:', question);
            
            const prompt = `Based on the following text, please answer this question: ${question}\n\nText:`;
            const result = await this.model.generateContent({
                contents: [{
                    parts: [{
                        text: `${prompt}\n\n${text}`
                    }]
                }]
            });
            const response = await result.response;
            console.log('Question answered successfully');
            
            return {
                answer: response.text(),
                metadata: {
                    model: "gemini-2.0-flash",
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error answering question:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                details: error.details || 'No additional details'
            });
            throw new Error(`Failed to answer question: ${error.message}`);
        }
    }
}

module.exports = new GeminiService(); 