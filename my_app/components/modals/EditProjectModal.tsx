"use client";

import React, { useState, useEffect } from 'react';
import { X, Edit3, FolderOpen, AlertCircle, Loader2, Calendar, Tag, Flag } from 'lucide-react';
import { useProjects, ProjectData } from '../../hooks/useProjects';
import { useFolders } from '../../hooks/useFolders';
import { Id } from '../../convex/_generated/dataModel';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData | null;
  onSuccess?: (projectId: Id<"projects">) => void;
}

const PROJECT_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' },
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
] as const;

const PROJECT_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-blue-600' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
  { value: 'high', label: 'High', color: 'text-red-600' },
] as const;

export default function EditProjectModal({ 
  isOpen, 
  onClose, 
  project,
  onSuccess 
}: EditProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get Convex hooks
  const { updateProject } = useProjects();
  const { folders, loading: foldersLoading } = useFolders();

  // Reset form when modal opens/closes or project changes
  useEffect(() => {
    if (isOpen && project) {
      setName(project.name || '');
      setDescription(project.description || '');
      setSelectedFolder(project.folderId || '');
      setStatus(project.status || 'active');
      setPriority(project.priority || 'medium');
      setTags(project.tags || []);
      setDueDate(project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '');
      setError(null);
      setIsSubmitting(false);
      setNewTag('');
    }
  }, [isOpen, project]);

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

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setNewTag('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    
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
      console.log('📝 Updating project:', project._id, { 
        name: trimmedName, 
        description, 
        folderId: selectedFolder,
        status,
        priority,
        tags,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined
      });
      
      // Call real Convex mutation
      const result = await updateProject(project._id, {
        name: trimmedName,
        description: description.trim() || undefined,
        folderId: selectedFolder ? selectedFolder as Id<"folders"> : undefined,
        status,
        priority,
        tags: tags.length > 0 ? tags : undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      });
      
      if (result.success) {
        console.log('✅ Project updated successfully!');
        onSuccess?.(project._id);
        onClose();
      } else {
        console.error('❌ Failed to update project:', result.error);
        setError(result.error || 'Failed to update project');
      }
    } catch (error) {
      console.error('❌ Error updating project:', error);
      setError('Failed to update project. Please try again.');
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

  if (!isOpen || !project) return null;

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
              <Edit3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Project
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update project information and settings
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Enter project name"
              disabled={isSubmitting}
              required
            />
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Enter project description (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Folder Selection */}
          <div>
            <label 
              htmlFor="projectFolder" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Folder
            </label>
            <div className="relative">
              <FolderOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="projectFolder"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting || foldersLoading}
              >
                <option value="">No folder (Root)</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label 
                htmlFor="projectStatus" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Status
              </label>
              <select
                id="projectStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'draft' | 'archived')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="projectPriority" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Priority
              </label>
              <select
                id="projectPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              >
                {PROJECT_PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label 
              htmlFor="projectDueDate" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Due Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="projectDueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-blue-600 dark:hover:text-blue-400"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add a tag"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                disabled={isSubmitting || !newTag.trim()}
              >
                Add
              </button>
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
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 