"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface UrlPreviewData {
  title?: string;
  description?: string;
  thumbnail?: string;
  favicon?: string;
  lastFetched?: number;
  fetchError?: string;
}

interface UrlConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { url: string; urlPreview?: UrlPreviewData }) => void;
  initialData?: {
    url?: string;
    urlPreview?: UrlPreviewData;
  };
}

export default function UrlConfigModal({ isOpen, onClose, onSave, initialData }: UrlConfigModalProps) {
  const { theme } = useTheme();
  const [url, setUrl] = useState(initialData?.url || '');
  const [preview, setPreview] = useState<UrlPreviewData | null>(initialData?.urlPreview || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setUrl(initialData?.url || '');
    setPreview(initialData?.urlPreview || null);
  }, [initialData]);

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const generateMockPreview = (url: string): UrlPreviewData => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      return {
        title: `Website - ${domain}`,
        description: `Content from ${domain}`,
        thumbnail: `https://via.placeholder.com/300x200/6366f1/ffffff?text=${encodeURIComponent(domain)}`,
        favicon: `https://www.google.com/s2/favicons?domain=${domain}`,
        lastFetched: Date.now(),
      };
    } catch {
      return {
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        lastFetched: Date.now(),
        fetchError: 'Invalid URL format',
      };
    }
  };

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl);
    setError('');
    
    if (newUrl && validateUrl(newUrl)) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        setPreview(generateMockPreview(newUrl));
        setIsLoading(false);
      }, 500);
    } else {
      setPreview(null);
    }
  };

  const handleSave = () => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    onSave({ url: url.trim(), urlPreview: preview || undefined });
    onClose();
  };

  const handleOpenUrl = () => {
    if (url && validateUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <div className={`w-full max-w-lg mx-auto rounded-xl shadow-2xl ${
        theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`} style={{ minWidth: '480px' }}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme.name === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 className={`text-xl font-semibold ${
            theme.name === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Configure URL
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
              theme.name === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* URL Input */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme.name === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Website URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://example.com"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme.name === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } ${error ? 'border-red-500' : ''}`}
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className={`ml-3 text-sm ${theme.name === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Loading preview...
              </span>
            </div>
          )}

          {/* Preview */}
          {preview && !isLoading && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                theme.name === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Preview
              </label>
              <div className={`border rounded-lg overflow-hidden ${
                theme.name === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-white'
              }`}>
                {preview.thumbnail && !preview.fetchError && (
                  <div className="w-full h-32 overflow-hidden">
                    <img
                      src={preview.thumbnail}
                      alt="URL Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className={`font-medium text-sm ${
                    theme.name === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {preview.title || 'No title'}
                  </h3>
                  {preview.description && (
                    <p className={`text-xs mt-1 ${
                      theme.name === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {preview.description}
                    </p>
                  )}
                  {preview.fetchError && (
                    <p className="text-xs mt-1 text-red-500">
                      {preview.fetchError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Test URL Button */}
          {url && validateUrl(url) && (
            <button
              onClick={handleOpenUrl}
              className={`w-full px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                theme.name === 'dark'
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open URL in new tab
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center space-x-2 text-red-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end space-x-3 p-6 border-t ${
          theme.name === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              theme.name === 'dark'
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!url.trim()}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              url.trim()
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save URL
          </button>
        </div>
      </div>
    </div>
  );
} 