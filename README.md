# Document Analysis Tool with Gemini AI

A powerful document analysis tool that uses Google's Gemini AI to extract insights and answer questions about uploaded documents. The application supports PDF and TXT files, providing real-time analysis and interactive Q&A capabilities.

## Features

- **Document Upload**: Support for PDF and TXT files
- **Real-time Processing**: Live progress tracking during document processing
- **Text Extraction**: Automatic extraction of text content from documents
- **AI-Powered Analysis**: 
  - Automatic insights generation using Gemini AI
  - Interactive Q&A interface for asking questions about the document
  - Context-aware responses based on document content
- **Modern UI**: Clean and responsive interface built with React and Tailwind CSS

## Tech Stack

### Frontend
- React.js
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB for data storage
- Google Gemini AI API for document analysis
- Multer for file upload handling

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Google Gemini AI API key

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd document-analyzer
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/document-analyzer
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the application**

   In one terminal (backend):
   ```bash
   cd backend
   npm start
   ```

   In another terminal (frontend):
   ```bash
   cd frontend
   npm start
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Usage Guide

1. **Upload a Document**
   - Click the upload button or drag and drop a PDF or TXT file
   - Maximum file size: 5MB
   - Supported formats: PDF, TXT

2. **Monitor Processing**
   - Real-time progress bar shows document processing status
   - Current stage and progress percentage are displayed

3. **View Analysis Results**
   - Once processing is complete, the document text is displayed
   - AI-generated insights are shown below the text
   - Q&A interface appears for interactive questioning

4. **Ask Questions**
   - Type your question in the Q&A interface
   - Click "Ask Question" to get AI-generated answers
   - Questions are answered based on the document's content

## API Endpoints

### Documents
- `POST /api/documents/upload` - Upload a new document
- `GET /api/documents/:id` - Get document details
- `GET /api/documents/:id/status` - Get document processing status
- `POST /api/documents/:id/ask` - Ask a question about the document

## Project Structure

```
document-analyzer/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── config/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google Gemini AI for providing the AI capabilities
- React and Node.js communities for their excellent documentation
- All contributors who have helped improve this project 