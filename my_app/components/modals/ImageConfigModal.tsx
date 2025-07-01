"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface CustomImageData {
  url?: string;
  uploadedFile?: string | null;
  thumbnail?: string | null;
  alt?: string;
  caption?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  fileSize?: number;
  mimeType?: string;
  lastModified?: number;
}

interface ImageConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { image: CustomImageData }) => void;
  initialData?: {
    image?: CustomImageData;
  };
}

export default function ImageConfigModal({ isOpen, onClose, onSave, initialData }: ImageConfigModalProps) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState(initialData?.image?.url || '');
  const [uploadedFile, setUploadedFile] = useState<string | null>(initialData?.image?.uploadedFile || null);
  const [altText, setAltText] = useState(initialData?.image?.alt || '');
  const [caption, setCaption] = useState(initialData?.image?.caption || '');
  const [preview, setPreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Partial<CustomImageData> | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData?.image) {
      const image = initialData.image;
      setImageUrl(image.url || '');
      setUploadedFile(image.uploadedFile || null);
      setAltText(image.alt || '');
      setCaption(image.caption || '');
      setPreview(image.thumbnail || image.url || image.uploadedFile || null);
      setActiveTab(image.url ? 'url' : 'upload');
    }
  }, [initialData]);

  const validateImageUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const extractImageMetadata = (file: File): Promise<Partial<CustomImageData>> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          dimensions: {
            width: img.width,
            height: img.height,
          },
          fileSize: file.size,
          mimeType: file.type,
          lastModified: file.lastModified,
        });
      };
      img.onerror = () => {
        resolve({
          fileSize: file.size,
          mimeType: file.type,
          lastModified: file.lastModified,
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size must be less than 5MB');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const metadata = await extractImageMetadata(file);
        
        setUploadedFile(base64);
        setPreview(base64);
        setImageData(metadata);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setError('Failed to process image');
      setIsLoading(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setError('');
    
    if (url && validateImageUrl(url)) {
      setPreview(url);
      setImageData({
        lastModified: Date.now(),
      });
    } else {
      setPreview(null);
      setImageData(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleSave = () => {
    const currentImage = activeTab === 'url' ? imageUrl : uploadedFile;
    
    if (!currentImage) {
      setError('Please provide an image URL or upload a file');
      return;
    }

    if (activeTab === 'url' && !validateImageUrl(imageUrl)) {
      setError('Please enter a valid image URL');
      return;
    }

    const imageConfig = {
      url: activeTab === 'url' ? imageUrl : undefined,
      uploadedFile: activeTab === 'upload' ? uploadedFile : undefined,
      thumbnail: preview,
      alt: altText.trim(),
      caption: caption.trim(),
      ...imageData,
    };

    onSave({ image: imageConfig });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] p-4">
      <div 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="image-modal-title"
        className={`w-full max-w-lg mx-auto rounded-xl shadow-2xl ${
          theme.name === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`} 
        style={{ minWidth: '480px' }}
      >
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          theme.name === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <h2 
            id="image-modal-title"
            className={`text-xl font-semibold ${
              theme.name === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Configure Image
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
          {/* Tabs */}
          <div className={`flex rounded-lg border ${
            theme.name === 'dark' ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <button
              onClick={() => setActiveTab('url')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors rounded-l-lg ${
                activeTab === 'url'
                  ? 'bg-indigo-500 text-white'
                  : theme.name === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Image URL
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors rounded-r-lg border-l ${
                activeTab === 'upload'
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : theme.name === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
              }`}
            >
              Upload File
            </button>
          </div>

          {/* Input Section */}
          {activeTab === 'url' ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme.name === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    theme.name === 'dark'
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } ${error ? 'border-red-500' : ''}`}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme.name === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Upload Image
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full p-12 border-2 border-dashed rounded-lg text-center transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : theme.name === 'dark'
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-700'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className={`mt-2 text-sm ${theme.name === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    {isLoading ? 'Processing...' : 'Drag and drop or click to select'}
                  </p>
                  <p className={`text-xs ${theme.name === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-2">
              <label className={`block text-sm font-medium ${
                theme.name === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Preview
              </label>
              <div className={`w-full h-48 border rounded-lg flex items-center justify-center overflow-hidden ${
                theme.name === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
              }`}>
                <img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            </div>
          )}

          {/* Alt Text */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme.name === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              Alt Text (Optional)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive text for accessibility"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme.name === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

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
            disabled={!((activeTab === 'url' && imageUrl) || (activeTab === 'upload' && uploadedFile))}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              ((activeTab === 'url' && imageUrl) || (activeTab === 'upload' && uploadedFile))
                ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
} 