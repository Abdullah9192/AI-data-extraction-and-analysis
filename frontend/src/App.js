import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import AnalysisResults from './components/AnalysisResults';

function App() {
  const [currentDocument, setCurrentDocument] = useState(null);
  const [documentStatus, setDocumentStatus] = useState(null);

  const handleUploadSuccess = (document) => {
    setCurrentDocument(document);
    setDocumentStatus(null);
  };

  const handleStatusChange = (status) => {
    setDocumentStatus(status);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Document Analysis Tool
        </h1>

        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {currentDocument && (
          <>
            <ProcessingStatus 
              documentId={currentDocument.id} 
              onStatusChange={handleStatusChange}
            />
            {documentStatus?.status === 'ready' && (
              <AnalysisResults documentId={currentDocument.id} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App; 