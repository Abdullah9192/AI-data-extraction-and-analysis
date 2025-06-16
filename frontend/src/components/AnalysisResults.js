import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AnalysisResults = ({ documentId }) => {
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState(null);
    const [askingQuestion, setAskingQuestion] = useState(false);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/documents/${documentId}`);
                setDocument(response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch document details');
                setLoading(false);
            }
        };

        if (documentId) {
            fetchDocument();
        }
    }, [documentId]);

    const handleAskQuestion = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;

        setAskingQuestion(true);
        try {
            const response = await axios.post(`http://localhost:5000/api/documents/${documentId}/ask`, {
                question: question
            });
            setAnswer(response.data);
        } catch (err) {
            setError('Failed to get answer');
        }
        setAskingQuestion(false);
    };

    if (loading) return <div className="text-center p-4">Loading analysis results...</div>;
    if (error) return <div className="text-red-500 p-4">{error}</div>;
    if (!document) return <div className="p-4">No document data available</div>;

    return (
        <div className="space-y-6 p-4">
            {/* Document Status */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Document Status</h3>
                <p className="text-gray-600">Status: {document.status}</p>
                <p className="text-gray-600">Filename: {document.filename}</p>
            </div>

            {/* Extracted Text */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Extracted Text</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{document.extractedText}</pre>
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">AI Insights</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{document.insights}</pre>
                </div>
            </div>

            {/* Question Answering */}
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-lg font-semibold mb-2">Ask Questions</h3>
                <form onSubmit={handleAskQuestion} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about the document..."
                            className="w-full p-2 border rounded-lg"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={askingQuestion}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {askingQuestion ? 'Getting Answer...' : 'Ask Question'}
                    </button>
                </form>

                {answer && (
                    <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">Answer:</h4>
                        <p className="text-sm">{answer.answer}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalysisResults; 