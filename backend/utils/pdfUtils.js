const fs = require('fs').promises;
const pdfParse = require('pdf-parse');

async function extractTextFromPDF(filePath) {
    try {
        const fileContent = await fs.readFile(filePath);
        const pdfData = await pdfParse(fileContent);
        return pdfData.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

module.exports = {
    extractTextFromPDF
}; 