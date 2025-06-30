"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageData: {
    src: string;
    alt?: string;
    caption?: string;
    title?: string;
    dimensions?: {
      width: number;
      height: number;
    };
    fileSize?: number;
    mimeType?: string;
  };
}

export default function ImageViewerModal({ isOpen, onClose, imageData }: ImageViewerModalProps) {
  const { theme } = useTheme();
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showInfo, setShowInfo] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset zoom and position when modal opens
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setShowInfo(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleZoomReset();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          setShowInfo(!showInfo);
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, showInfo, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  };

  const handleZoomReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-black bg-opacity-50 z-10">
        <div className="flex items-center space-x-4">
          <h3 className="text-white font-medium truncate max-w-md">
            {imageData.title || imageData.alt || 'Image Viewer'}
          </h3>
          {imageData.caption && (
            <span className="text-gray-300 text-sm truncate max-w-sm">
              {imageData.caption}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors"
            title="Toggle Info (I)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors"
            title="Close (ESC)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black bg-opacity-50 rounded-lg p-2 z-10">
        <button
          onClick={handleZoomOut}
          className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          title="Zoom Out (-)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </button>
        <span className="text-white text-sm font-mono min-w-[4rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          title="Zoom In (+)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onClick={handleZoomReset}
          className="p-2 rounded text-white hover:bg-white hover:bg-opacity-20 transition-colors"
          title="Reset Zoom (0)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Image Info Panel */}
      {showInfo && (
        <div className={`absolute bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm z-10 ${
          theme.name === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            theme.name === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Image Information
          </h4>
          <div className={`space-y-1 text-sm ${
            theme.name === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {imageData.dimensions && (
              <p>
                <span className="font-medium">Dimensions:</span>{' '}
                {imageData.dimensions.width} × {imageData.dimensions.height}
              </p>
            )}
            {imageData.fileSize && (
              <p>
                <span className="font-medium">Size:</span>{' '}
                {formatFileSize(imageData.fileSize)}
              </p>
            )}
            {imageData.mimeType && (
              <p>
                <span className="font-medium">Type:</span>{' '}
                {imageData.mimeType}
              </p>
            )}
            {imageData.alt && (
              <p>
                <span className="font-medium">Alt Text:</span>{' '}
                {imageData.alt}
              </p>
            )}
          </div>
          <div className={`mt-3 pt-2 border-t text-xs ${
            theme.name === 'dark' ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}>
            <p>Press I to toggle info</p>
            <p>Use +/- to zoom, 0 to reset</p>
            <p>Drag to pan when zoomed</p>
          </div>
        </div>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <img
          ref={imageRef}
          src={imageData.src}
          alt={imageData.alt || 'Fullscreen image'}
          className="max-w-none transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            maxWidth: zoom === 1 ? '90vw' : 'none',
            maxHeight: zoom === 1 ? '90vh' : 'none',
          }}
          draggable={false}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded z-10 pointer-events-none">
        ESC to close • Scroll to zoom • Drag to pan
      </div>
    </div>
  );
} 