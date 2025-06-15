import React, { useState } from 'react';
import ExportMenu from './ExportMenu';
import ShareModal from './ShareModal';
import { useTheme } from '../contexts/ThemeContext';

interface Project {
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

const mockFolders: Folder[] = [
  { id: 'marketing', name: 'Marketing', color: '#3b82f6', projectCount: 5 },
  { id: 'sales', name: 'Sales', color: '#10b981', projectCount: 3 },
  { id: 'product', name: 'Product', color: '#f59e0b', projectCount: 8 },
  { id: 'support', name: 'Support', color: '#ef4444', projectCount: 2 },
];

const mockProjects: Project[] = [
  { id: '1', name: 'Lead Generation Funnel', folder: 'marketing', lastModified: new Date(), status: 'active' },
  { id: '2', name: 'Product Onboarding', folder: 'product', lastModified: new Date(), status: 'draft' },
  { id: '3', name: 'Sales Pipeline', folder: 'sales', lastModified: new Date(), status: 'active' },
  { id: '4', name: 'Customer Support Flow', folder: 'support', lastModified: new Date(), status: 'archived' },
];

interface HeaderProps {
  currentProject?: Project;
  onProjectChange?: (project: Project) => void;
}

const Header: React.FC<HeaderProps> = ({ currentProject, onProjectChange }) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const currentProjectData = currentProject || mockProjects[0];
  const currentFolderData = mockFolders.find(f => f.id === currentProjectData.folder);

  const filteredProjects = selectedFolder === 'all' 
    ? mockProjects 
    : mockProjects.filter(p => p.folder === selectedFolder);

  const handleProjectSelect = (project: Project) => {
    setShowProjectDropdown(false);
    if (onProjectChange) {
      onProjectChange(project);
    }
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

  const getStatusColor = (status: Project['status']) => {
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
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: theme.colors.accent.primary }}
          >
            <span 
              className="font-bold text-sm"
              style={{ color: theme.colors.text.inverse }}
            >
              FX
            </span>
          </div>
          <h1 
            className="text-xl font-semibold"
            style={{ color: theme.colors.text.primary }}
          >
            Flow X
          </h1>
        </div>

        <div 
          className="h-6 w-px"
          style={{ backgroundColor: theme.colors.border.secondary }}
        />

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
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
          {showProjectDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Projects</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFolderModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Folder
                    </button>
                    <button
                      onClick={() => setShowProjectModal(true)}
                      className="text-sm text-blue-600 hover:text-blue-700"
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
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                      onClick={() => handleProjectSelect(project)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: folder?.color || '#6b7280' }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500">{folder?.name}</div>
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
      {showProjectDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowProjectDropdown(false)}
        />
      )}

      {/* Mock Modals (placeholder) */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
            <p className="text-gray-600 mb-4">This is a mock modal for creating folders.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFolderModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Create New Project</h3>
            <p className="text-gray-600 mb-4">This is a mock modal for creating projects.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowProjectModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

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
};

export default Header; 