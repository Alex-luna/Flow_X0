"use client";

import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Id } from '../../convex/_generated/dataModel';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  title: string;
  message: string;
  itemName: string;
  itemType: 'folder' | 'project';
  destructiveAction?: boolean;
  warningMessage?: string;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm,
  title,
  message,
  itemName,
  itemType,
  destructiveAction = true,
  warningMessage
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const requiresConfirmation = destructiveAction;
  const expectedConfirmText = `delete ${itemName}`;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setError(null);
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Handle confirmation
  const handleConfirm = async () => {
    if (requiresConfirmation && confirmText !== expectedConfirmText) {
      setError(`Please type "${expectedConfirmText}" to confirm`);
      return;
    }

    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await onConfirm();
      if (success) {
        onClose();
      } else {
        setError(`Failed to delete ${itemType}. Please try again.`);
      }
    } catch (error) {
      console.error(`Failed to delete ${itemType}:`, error);
      setError(`Failed to delete ${itemType}. Please try again.`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isDeleting]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isDeleting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Main Message */}
          <div className="text-gray-700 dark:text-gray-300">
            <p>{message}</p>
            
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="font-medium text-gray-900 dark:text-white">
                {itemType === 'folder' ? '📁' : '📄'} {itemName}
              </p>
            </div>
          </div>

          {/* Warning Message */}
          {warningMessage && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {warningMessage}
                </p>
              </div>
            </div>
          )}

          {/* Destructive Action Warning */}
          {destructiveAction && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium mb-1">This action cannot be undone.</p>
                  <p>
                    {itemType === 'folder' 
                      ? 'This will permanently delete the folder and all its contents.' 
                      : 'This will permanently delete the project and all its data.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Input */}
          {requiresConfirmation && (
            <div>
              <label 
                htmlFor="confirmText" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Type <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                  {expectedConfirmText}
                </code> to confirm:
              </label>
              <input
                id="confirmText"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={expectedConfirmText}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-red-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                disabled={isDeleting}
                autoFocus
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 
                           border border-red-200 dark:border-red-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isDeleting}
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              isDeleting || 
              (requiresConfirmation && confirmText !== expectedConfirmText)
            }
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 
                       disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors
                       flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                Delete {itemType}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 