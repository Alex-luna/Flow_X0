"use client";

import React, { useState, useEffect } from 'react';
import { X, Edit3, FolderOpen, AlertCircle, Loader2 } from 'lucide-react';
import { useFolders } from '../../hooks/useFolders';
import { Id } from '../../convex/_generated/dataModel';

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId: Id<"folders"> | null;
  onSuccess?: (folderId: Id<"folders">) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6B7280', // Gray
];

export default function EditFolderModal({ 
  isOpen, 
  onClose, 
  folderId,
  onSuccess 
}: EditFolderModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get Convex hooks
  const { folders, updateFolder, loading: foldersLoading } = useFolders();

  // Find the current folder
  const currentFolder = folderId ? folders.find(f => f._id === folderId) : null;

  // Reset form when modal opens/closes or folder changes
  useEffect(() => {
    if (isOpen && currentFolder) {
      setName(currentFolder.name || '');
      setColor(currentFolder.color || PRESET_COLORS[0]);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentFolder]);

  // Validate folder name
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return "Folder name is required";
    }
    
    if (name.length > 50) {
      return "Folder name must be less than 50 characters";
    }
    
    // Check for duplicate names (excluding current folder)
    const duplicate = folders.find(f => 
      f._id !== folderId && 
      f.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (duplicate) {
      return "A folder with this name already exists";
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderId || !currentFolder) return;
    
    setError(null);
    setIsSubmitting(true);
    
    // Validate form
    const trimmedName = name.trim();
    const validation = validateName(trimmedName);
    if (validation) {
      setError(validation);
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('📝 Updating folder:', folderId, { 
        name: trimmedName, 
        color 
      });
      
      // Call real Convex mutation
      const result = await updateFolder(folderId, {
        name: trimmedName,
        color,
      });
      
      if (result.success) {
        console.log('✅ Folder updated successfully!');
        onSuccess?.(folderId);
        onClose();
      } else {
        console.error('❌ Failed to update folder:', result.error);
        setError(result.error || 'Failed to update folder');
      }
    } catch (error) {
      console.error('❌ Error updating folder:', error);
      setError('Failed to update folder. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !currentFolder) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Folder
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update folder name and color
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Folder Name */}
          <div>
            <label 
              htmlFor="folderName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Folder Name *
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="folderName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter folder name"
                disabled={isSubmitting}
                required
                maxLength={50}
              />
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Folder Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  type="button"
                  onClick={() => setColor(presetColor)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    color === presetColor 
                      ? 'border-gray-400 dark:border-gray-300 scale-110' 
                      : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                  }`}
                  style={{ backgroundColor: presetColor }}
                  disabled={isSubmitting}
                  title={`Select ${presetColor}`}
                />
              ))}
            </div>
            
            {/* Custom Color Input */}
            <div className="mt-3">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Or choose custom color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {name || 'Folder Name'}
              </span>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 