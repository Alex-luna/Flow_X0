"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

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
  setCurrentProject: (project: Project | null) => void;
  isLoading: boolean;
  isHydrated: boolean;
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

  const value: ProjectContextType = {
    currentProject,
    setCurrentProject,
    isLoading,
    isHydrated,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}; 