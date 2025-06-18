"use client";

import React, { useState, useEffect } from 'react';
import { X, FolderOpen, FileText, AlertCircle, Loader2, Plus } from 'lucide-react';
import { useProjects } from '../../hooks/useProjects';
import { useFolders } from '../../hooks/useFolders';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (projectId: string) => void;
}

const PROJECT_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Project',
    description: 'Start with an empty canvas',
    icon: FileText,
  },
  {
    id: 'lead-gen',
    name: 'Lead Generation',
    description: 'Pre-built lead capture funnel',
    icon: Plus,
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    description: 'Customer purchase journey',
    icon: Plus,
  },
];

export default function CreateProjectModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(PROJECT_TEMPLATES[0].id);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get Convex hooks
  const { createProject } = useProjects();
  const { folders, loading: foldersLoading } = useFolders();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedFolder(folders.length > 0 ? folders[0]._id : '');
      setSelectedTemplate(PROJECT_TEMPLATES[0].id);
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, folders]);

  // Update selected folder when folders load
  useEffect(() => {
    if (folders.length > 0 && !selectedFolder) {
      setSelectedFolder(folders[0]._id);
    }
  }, [folders, selectedFolder]);

  // Validate project name
  const validateName = (name: string): string | null => {
    if (!name.trim()) {
      return "Project name is required";
    }
    
    if (name.length > 100) {
      return "Project name must be less than 100 characters";
    }
    
    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      console.log('📊 Submitting project creation:', { 
        name: trimmedName, 
        description, 
        folderId: selectedFolder,
        template: selectedTemplate 
      });
      
      // Call real Convex mutation
      const result = await createProject({
        name: trimmedName,
        description: description.trim() || undefined,
        folderId: selectedFolder ? selectedFolder as any : undefined,
        status: "active",
        settings: {
          snapToGrid: true,
          showMiniMap: true,
          canvasBackground: "#ffffff",
          theme: "light",
          isPublic: false,
          allowComments: true,
          autoSave: true,
          autoSaveInterval: 5000,
        },
      });
      
      if (result.success && result.projectId) {
        console.log('✅ Project created successfully!', result.projectId);
        onSuccess?.(result.projectId);
        onClose();
      } else {
        console.error('❌ Failed to create project:', result.error);
        setError(result.error || 'Failed to create project');
      }
    } catch (error) {
      console.error('❌ Error creating project:', error);
      setError('Failed to create project. Please try again.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Project
              </h2>
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
          {/* Project Name */}
          <div>
            <label 
              htmlFor="projectName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Project Name *
            </label>
            <input
              id="projectName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isSubmitting}
              autoFocus
              maxLength={100}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {name.length}/100 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label 
              htmlFor="projectDescription" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Description
            </label>
            <textarea
              id="projectDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              disabled={isSubmitting}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FolderOpen className="w-4 h-4 inline mr-2" />
              Folder
            </label>
            {foldersLoading ? (
              <div className="flex items-center gap-2 p-2 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading folders...
              </div>
            ) : folders.length === 0 ? (
              <div className="p-2 text-gray-500 dark:text-gray-400 text-sm">
                No folders available. Create a folder first.
              </div>
            ) : (
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              >
                <option value="">No folder</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Template
            </label>
            <div className="grid grid-cols-1 gap-3">
              {PROJECT_TEMPLATES.map((template) => (
                <label
                  key={template.id}
                  className={`
                    flex items-center p-3 border rounded-lg cursor-pointer transition-all
                    ${selectedTemplate === template.id 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="template"
                    value={template.id}
                    checked={selectedTemplate === template.id}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="sr-only"
                    disabled={isSubmitting}
                  />
                  <template.icon className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {template.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 
                           border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                         hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                         disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors
                         flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 