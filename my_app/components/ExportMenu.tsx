"use client";

import React, { useState, useRef } from 'react';

interface ExportMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'png' | 'jpg' | 'json') => void;
  onImport: (file: File) => void;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ isOpen, onClose, onExport, onImport }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'png' | 'jpg' | 'json' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: 'pdf' | 'png' | 'jpg' | 'json') => {
    setIsExporting(true);
    setExportFormat(format);
    
    try {
      console.log(`🚀 Exporting as ${format.toUpperCase()}...`);
      await onExport(format);
      
      // Mock delay for export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`✅ Export as ${format.toUpperCase()} completed`);
    } catch (error) {
      console.error(`❌ Export as ${format.toUpperCase()} failed:`, error);
    } finally {
      setIsExporting(false);
      setExportFormat(null);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('📁 Importing file:', file.name);
      onImport(file);
      // Reset input
      event.target.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Export & Import</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isExporting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Export Section */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-800 mb-4">Export Canvas</h4>
          <div className="grid grid-cols-2 gap-3">
            {/* Image Formats */}
            <button
              onClick={() => handleExport('png')}
              disabled={isExporting}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                exportFormat === 'png' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-green-600 font-semibold text-sm">PNG</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Image (PNG)</span>
              <span className="text-xs text-gray-500 text-center">High quality</span>
              {exportFormat === 'png' && isExporting && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-blue-600">Exporting...</span>
                </div>
              )}
            </button>

            <button
              onClick={() => handleExport('jpg')}
              disabled={isExporting}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                exportFormat === 'jpg' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-yellow-600 font-semibold text-sm">JPG</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Image (JPG)</span>
              <span className="text-xs text-gray-500 text-center">Compressed</span>
              {exportFormat === 'jpg' && isExporting && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-blue-600">Exporting...</span>
                </div>
              )}
            </button>

            {/* Document Format */}
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                exportFormat === 'pdf' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-red-600 font-semibold text-sm">PDF</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Document (PDF)</span>
              <span className="text-xs text-gray-500 text-center">Printable</span>
              {exportFormat === 'pdf' && isExporting && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-blue-600">Exporting...</span>
                </div>
              )}
            </button>

            {/* Flow Data */}
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              className={`flex flex-col items-center p-4 border-2 rounded-lg transition-all ${
                exportFormat === 'json' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <span className="text-purple-600 font-semibold text-sm">JSON</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Flow Data</span>
              <span className="text-xs text-gray-500 text-center">n8n compatible</span>
              {exportFormat === 'json' && isExporting && (
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-blue-600">Exporting...</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Import Section */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-800 mb-4">Import Flow</h4>
          <button
            onClick={handleImportClick}
            disabled={isExporting}
            className={`w-full flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-lg transition-all ${
              isExporting 
                ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-700">Import JSON Flow</div>
              <div className="text-xs text-gray-500">Upload .json file to restore flow</div>
            </div>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Help Text */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Tip:</strong> JSON export preserves all flow data and can be imported into n8n or back into Flow X. 
            Image exports capture the current canvas view.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportMenu; 