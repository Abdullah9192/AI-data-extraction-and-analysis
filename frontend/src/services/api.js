import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocumentStatus = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/status`);
  return response.data;
};

export const getDocumentContent = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/content`);
  return response.data;
};

export const getPromptTemplates = async () => {
  const response = await api.get('/prompts');
  return response.data;
};

export const createPromptTemplate = async (template) => {
  const response = await api.post('/prompts', template);
  return response.data;
};

export const updatePromptTemplate = async (id, template) => {
  const response = await api.put(`/prompts/${id}`, template);
  return response.data;
};

export const deletePromptTemplate = async (id) => {
  const response = await api.delete(`/prompts/${id}`);
  return response.data;
};

export const initializePromptTemplates = async () => {
  const response = await api.post('/prompts/initialize');
  return response.data;
};

export const analyzeDocument = async (documentId, promptTemplateId, customPrompt) => {
  const response = await api.post('/analysis/analyze', {
    documentId,
    promptTemplateId,
    customPrompt,
  });
  return response.data;
};

export const getAnalysisHistory = async (documentId) => {
  const response = await api.get(`/analysis/document/${documentId}`);
  return response.data;
};

export const getAnalysis = async (id) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
}; 