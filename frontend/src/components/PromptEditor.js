import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PromptEditor = ({ onAnalysisStart }) => {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/prompts');
      setTemplates(response.data);
    } catch (err) {
      setError('Error fetching prompt templates');
    }
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCustomPrompt(template.promptText);
  };

  const handleSubmit = async () => {
    if (!customPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/analysis', {
        promptTemplateId: selectedTemplate?.id,
        finalPrompt: customPrompt
      });

      onAnalysisStart(response.data);
      setCustomPrompt('');
      setSelectedTemplate(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error starting analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md mt-4">
      <h3 className="text-xl font-bold mb-4">Analysis Prompt</h3>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Select Template
        </label>
        <select
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const template = templates.find(t => t.id === e.target.value);
            handleTemplateSelect(template);
          }}
          value={selectedTemplate?.id || ''}
        >
          <option value="">Select a template...</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Customize Prompt
        </label>
        <textarea
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter your analysis prompt..."
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !customPrompt.trim()}
        className={`w-full py-2 px-4 rounded-lg text-white font-bold ${
          loading || !customPrompt.trim()
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? 'Starting Analysis...' : 'Start Analysis'}
      </button>
    </div>
  );
};

export default PromptEditor; 