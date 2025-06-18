"use client";

import React, { useState } from 'react';
import { useTheme } from "../contexts/ThemeContext";
import ExportMenu from "./ExportMenu";
import ShareModal from "./ShareModal";
import CreateFolderModal from "./modals/CreateFolderModal";
import CreateProjectModal from "./modals/CreateProjectModal";
import FlowXIcon from './logos/FlowXIcon';

// Mock data interfaces for development
interface MockProject {
  id: string;
  name: string;
  folder: string;
  lastModified: Date;
  status: 'active' | 'draft' | 'archived';
}

interface Folder {
  id: string;
  name: string;
  color: string;
  projectCount: number;
}

// Mock data for development
const mockFolders: Folder[] = [
  { id: 'personal', name: 'Personal', color: '#3b82f6', projectCount: 3 },
  { id: 'work', name: 'Work', color: '#10b981', projectCount: 5 },
  { id: 'clients', name: 'Clients', color: '#f59e0b', projectCount: 2 },
];

const mockProjects: MockProject[] = [
  { id: '1', name: 'Lead Generation Funnel', folder: 'work', lastModified: new Date(), status: 'active' },
  { id: '2', name: 'E-commerce Flow', folder: 'personal', lastModified: new Date(), status: 'draft' },
  { id: '3', name: 'Client Onboarding', folder: 'clients', lastModified: new Date(), status: 'active' },
];

export default function Header() {
  const { theme, isDark, toggleTheme, isHydrated } = useTheme();
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  
  // Modal states
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Don't render anything until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return (
      <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
        <div className="flex items-center space-x-4">
          <FlowXIcon className="w-8 h-8" />
          <span className="text-xl font-bold text-gray-900">Flow X</span>
        </div>
      </header>
    );
  }

  // Use mock data for display until real integration is complete
  const currentProjectData = mockProjects[0];
  const currentFolderData = mockFolders.find(f => f.id === currentProjectData.folder);

  const filteredProjects = selectedFolder === 'all' 
    ? mockProjects 
    : mockProjects.filter(p => p.folder === selectedFolder);

  const handleProjectSelect = () => {
    setIsProjectDropdownOpen(false);
    // TODO: Implement project selection logic when needed
  };

  const handleFolderCreated = (folderId: string) => {
    console.log('✅ Folder created:', folderId);
    setIsProjectDropdownOpen(false);
  };

  const handleProjectCreated = (projectId: string) => {
    console.log('✅ Project created:', projectId);
    setIsProjectDropdownOpen(false);
  };

  const handleExport = async (format: 'pdf' | 'png' | 'jpg' | 'json') => {
    console.log(`🚀 Starting export as ${format.toUpperCase()}`);
    
    // Mock export functionality
    switch (format) {
      case 'pdf':
        console.log('📄 Exporting to PDF...');
        break;
      case 'png':
        console.log('🖼️ Exporting to PNG...');
        break;
      case 'jpg':
        console.log('📸 Exporting to JPG...');
        break;
      case 'json':
        console.log('📊 Exporting flow data to JSON...');
        // Mock n8n-compatible export
        const mockFlowData = {
          name: currentProjectData.name,
          nodes: [],
          connections: {},
          version: '1.0',
          createdAt: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(mockFlowData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProjectData.name.replace(/\s+/g, '_')}_flow.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;
    }
  };

  const handleImport = (file: File) => {
    console.log('📁 Importing file:', file.name);
    
    if (file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target?.result as string);
          console.log('✅ Successfully parsed flow data:', flowData);
          // Mock import functionality
          alert(`Successfully imported flow: ${flowData.name || 'Unnamed Flow'}`);
        } catch (error) {
          console.error('❌ Failed to parse JSON:', error);
          alert('Error: Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Error: Please select a JSON file');
    }
    
    setShowExportMenu(false);
  };

  const getStatusColor = (status: MockProject['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      className="h-16 flex items-center justify-between px-6 border-b"
      style={{ 
        backgroundColor: theme.colors.background.elevated,
        borderColor: theme.colors.border.primary
      }}
    >
      {/* Left Section - Brand and Project */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <FlowXIcon 
            width={32} 
            height={31} 
            className="shrink-0"
          />
        </div>

        <div 
          className="h-6 w-px"
          style={{ backgroundColor: theme.colors.border.secondary }}
        />

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:brightness-110"
            style={{ 
              backgroundColor: theme.colors.background.secondary
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentFolderData?.color || theme.colors.border.secondary }}
              />
              <span 
                className="font-medium"
                style={{ color: theme.colors.text.primary }}
              >
                {currentProjectData.name}
              </span>
            </div>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: theme.colors.text.secondary }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Project Dropdown */}
          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">Projects</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowCreateFolder(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + Folder
                    </button>
                    <button
                      onClick={() => setShowCreateProject(true)}
                      className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      + Project
                    </button>
                  </div>
                </div>

                {/* Folder Filter */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedFolder('all')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedFolder === 'all' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All
                  </button>
                  {mockFolders.map(folder => (
                    <button
                      key={folder.id}
                      onClick={() => setSelectedFolder(folder.id)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedFolder === folder.id 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      {folder.name} ({folder.projectCount})
                    </button>
                  ))}
                </div>
              </div>

              {/* Project List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredProjects.map(project => {
                  const folder = mockFolders.find(f => f.id === project.folder);
                  return (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect()}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: folder?.color || '#6b7280' }}
                        />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{folder?.name}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.text.secondary }}>
          <span 
            className={`w-2 h-2 rounded-full`}
            style={{ 
              backgroundColor: currentProjectData.status === 'active' 
                ? theme.colors.accent.success 
                : theme.colors.accent.warning 
            }}
          />
          {currentProjectData.status === 'active' ? 'Auto-saved' : 'Draft'}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors hover:brightness-110"
          style={{ backgroundColor: theme.colors.background.secondary }}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? (
            // Sun icon for light mode
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.text.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: theme.colors.text.primary }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <button 
          onClick={() => setShowShareModal(true)}
          className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          style={{ 
            backgroundColor: theme.colors.accent.primary,
            color: theme.colors.text.inverse
          }}
        >
          Share
        </button>

        <button 
          onClick={() => setShowExportMenu(true)}
          className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
          style={{ 
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary
          }}
        >
          Export
        </button>
      </div>

      {/* Click outside to close dropdown */}
      {isProjectDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsProjectDropdownOpen(false)}
        />
      )}

      {/* Real Modals */}
      <CreateFolderModal
        isOpen={showCreateFolder}
        onClose={() => setShowCreateFolder(false)}
        onSuccess={handleFolderCreated}
      />

      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Export Menu */}
      <ExportMenu
        isOpen={showExportMenu}
        onClose={() => setShowExportMenu(false)}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        projectName={currentProjectData.name}
      />
    </div>
  );
} 