"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useProjects, ProjectData } from "../hooks/useProjects";

// Types
export interface Project {
  id: string;
  name: string;
  folderId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  accessedAt?: Date;
  settings?: {
    autoSave?: boolean;
    snapToGrid?: boolean;
    showMiniMap?: boolean;
    gridSize?: number;
  };
}

export interface ProjectContextType {
  currentProject: Project | null;
  currentProjectData: ProjectData | null;
  setCurrentProject: (project: Project | null) => void;
  isLoading: boolean;
  isHydrated: boolean;
  // New functionality for real integration
  selectProject: (projectId: Id<"projects">) => void;
  clearProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

interface ProjectProviderProps {
  children: ReactNode;
}

export const ProjectProvider: React.FC<ProjectProviderProps> = ({ children }) => {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Use real Convex data
  const { projects } = useProjects();

  // Get current project data from Convex
  const currentProjectData = currentProject 
    ? projects.find(p => p._id === currentProject.id) || null
    : null;

  // Load project from localStorage only after hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsHydrated(true);
      
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const savedProject = localStorage.getItem('flowx-current-project');
          if (savedProject) {
            const parsed = JSON.parse(savedProject);
            // Ensure dates are properly converted
            if (parsed.createdAt) parsed.createdAt = new Date(parsed.createdAt);
            if (parsed.updatedAt) parsed.updatedAt = new Date(parsed.updatedAt);
            if (parsed.accessedAt) parsed.accessedAt = new Date(parsed.accessedAt);
            setCurrentProjectState(parsed);
          }
        }
      } catch (error) {
        console.warn('Failed to load project from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Auto-select first available project if none selected
  useEffect(() => {
    if (isHydrated && !currentProject && projects.length > 0) {
      const firstProject = projects[0];
      selectProject(firstProject._id);
    }
  }, [isHydrated, currentProject, projects]);

  const setCurrentProject = (project: Project | null) => {
    setCurrentProjectState(project);
    
    // Save to localStorage only after hydration
    if (isHydrated) {
      try {
        if (project) {
          localStorage.setItem('flowx-current-project', JSON.stringify(project));
        } else {
          localStorage.removeItem('flowx-current-project');
        }
      } catch (error) {
        console.warn('Failed to save project to localStorage:', error);
      }
    }
  };

  const selectProject = (projectId: Id<"projects">) => {
    const projectData = projects.find(p => p._id === projectId);
    if (projectData) {
      const project: Project = {
        id: projectData._id,
        name: projectData.name,
        folderId: projectData.folderId,
        description: projectData.description,
        createdAt: new Date(projectData._creationTime),
        updatedAt: new Date(projectData.lastModified),
        isDeleted: projectData.isDeleted,
        accessedAt: new Date(projectData.accessedAt),
        settings: projectData.settings,
      };
      setCurrentProject(project);
      console.log('✅ Project selected:', projectData.name);
    }
  };

  const clearProject = () => {
    setCurrentProject(null);
    console.log('🧹 Project cleared');
  };

  const value: ProjectContextType = {
    currentProject,
    currentProjectData,
    setCurrentProject,
    isLoading,
    isHydrated,
    selectProject,
    clearProject,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 