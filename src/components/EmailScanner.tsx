import React, { useState } from 'react';
import { Mail, Shield, AlertTriangle } from 'lucide-react';
import { analyzeEmail } from '../services/gemini';
import type { EmailData, ScanResult } from '../types';
import toast from 'react-hot-toast';

export default function EmailScanner() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [emailData, setEmailData] = useState<EmailData>({
    sender: '',
    subject: '',
    content: '',
    links: [],
    attachments: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const scanResult = await analyzeEmail(emailData);
      setResult(scanResult);
      toast.success('Analysis complete');
    } catch (error) {
      toast.error('Failed to analyze email');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl p-6 bg-white rounded-xl shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Mail className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Email Phishing Scanner</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Sender Email</label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={emailData.sender}
            onChange={(e) => setEmailData({ ...emailData, sender: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Content</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={4}
            value={emailData.content}
            onChange={(e) => setEmailData({ ...emailData, content: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Links (one per line)</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            rows={2}
            value={emailData.links.join('\n')}
            onChange={(e) => setEmailData({ ...emailData, links: e.target.value.split('\n').filter(Boolean) })}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="w-5 h-5" />
              Scan Email
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`mt-6 p-4 rounded-lg ${result.isPhishing ? 'bg-red-50' : 'bg-green-50'}`}>
          <div className="flex items-center gap-2 mb-4">
            {result.isPhishing ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Shield className="w-6 h-6 text-green-600" />
            )}
            <h3 className={`text-lg font-semibold ${result.isPhishing ? 'text-red-800' : 'text-green-800'}`}>
              {result.isPhishing ? 'Phishing Detected!' : 'Email Appears Safe'}
            </h3>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700"><strong>Confidence:</strong> {result.confidence}%</p>
            <p className="text-gray-700"><strong>Analysis:</strong> {result.explanation}</p>
            <div>
              <strong className="text-gray-700">Recommendations:</strong>
              <ul className="list-disc list-inside mt-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}