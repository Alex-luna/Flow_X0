"use client";

import React, { useState, useEffect, useRef } from 'react';

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
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideControlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setShowControls(true);
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
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.2, 4));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.2, 0.2));
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
    setZoom(prev => Math.min(Math.max(prev * delta, 0.2), 4));
    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handleMouseEnter = () => {
    setShowControls(true);
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    if (!isDragging) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black z-[99999] flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className={`fixed top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        title="Close (ESC)"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Title (if exists) */}
      {(imageData.title || imageData.caption) && (
        <div
          className={`fixed top-4 left-4 z-10 text-white text-sm max-w-md transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {imageData.title && (
            <div className="font-medium mb-1">{imageData.title}</div>
          )}
          {imageData.caption && (
            <div className="text-gray-300 text-xs">{imageData.caption}</div>
          )}
        </div>
      )}

      {/* Zoom Controls */}
      {zoom !== 1 && (
        <div
          className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black bg-opacity-50 rounded-lg px-3 py-2 text-white text-sm transition-all duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {Math.round(zoom * 100)}%
        </div>
      )}

      {/* Image Container */}
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
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
          alt={imageData.alt || 'Image'}
          className="max-w-none transition-transform duration-100 ease-out select-none"
          style={{
            transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
            maxWidth: zoom === 1 ? '90vw' : 'none',
            maxHeight: zoom === 1 ? '90vh' : 'none',
          }}
          draggable={false}
          onLoad={() => {
            // Auto-hide controls after image loads
            setTimeout(() => setShowControls(false), 3000);
          }}
        />
      </div>

      {/* Instructions - Only shown briefly */}
      <div
        className={`fixed bottom-4 right-4 z-10 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded transition-all duration-300 ${
          showControls ? 'opacity-60' : 'opacity-0'
        }`}
      >
        Scroll to zoom
      </div>
    </div>
  );
} 