import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    console.log('File input changed');
    const file = event.target.files[0];
    console.log('Selected file:', {
      name: file?.name,
      type: file?.type,
      size: file?.size
    });

    if (file && (file.type === 'application/pdf' || file.type === 'text/plain')) {
      setSelectedFile(file);
      setError(null);
      console.log('File accepted');
    } else {
      setSelectedFile(null);
      setError('Please select a PDF or TXT file');
      console.log('Invalid file type:', file?.type);
    }
  };

  const handleUpload = async () => {
    console.log('Starting upload process');
    
    if (!selectedFile) {
      console.log('No file selected');
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    console.log('FormData created with file:', selectedFile.name);

    try {
      console.log('Sending request to backend...');
      const response = await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Upload response received:', response.data);
      onUploadSuccess(response.data);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      setError(error.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
      console.log('Upload process completed');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Upload Document</h2>
      
      <div className="space-y-4">
        <div>
          <input
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className={`w-full py-2 px-4 rounded-lg text-white font-semibold
            ${!selectedFile || uploading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload; 