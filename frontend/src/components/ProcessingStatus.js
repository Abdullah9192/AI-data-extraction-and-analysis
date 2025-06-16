import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProcessingStatus = ({ documentId, onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/documents/${documentId}/status`);
        setStatus(response.data);
        setError(null);
        
        // Notify parent component of status change
        if (onStatusChange) {
          onStatusChange(response.data);
        }
      } catch (err) {
        setError('Error checking status');
      }
    };

    if (documentId) {
      const interval = setInterval(checkStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [documentId, onStatusChange]);

  if (!status) return null;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Processing Status</h3>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-gray-700">Progress</span>
          <span className="text-gray-700">{status.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${status.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Status:</span>
          <span className={`font-medium ${
            status.status === 'ready' ? 'text-green-600' :
            status.status === 'error' ? 'text-red-600' :
            'text-blue-600'
          }`}>
            {status.status}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Current Stage:</span>
          <span className="font-medium">{status.currentStage}</span>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProcessingStatus; 