"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Types
export interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  folder: string;
  status: "active" | "archived" | "draft";
  lastModified: number;
  settings?: {
    snapToGrid: boolean;
    showMiniMap: boolean;
    canvasBackground: string;
    theme: "light" | "dark";
  };
}

export interface ProjectContextType {
  // Current project state
  currentProject: Project | null;
  currentFlowId: Id<"flows"> | null;
  
  // Project management
  projects: Project[] | undefined;
  setCurrentProject: (project: Project) => void;
  createProject: (data: {
    name: string;
    description?: string;
    folder: string;
    status?: "active" | "archived" | "draft";
  }) => Promise<Id<"projects">>;
  updateCurrentProject: (updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: Id<"projects">) => Promise<void>;
  
  // Loading states
  isLoadingProjects: boolean;
  isLoadingCurrentFlow: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [currentFlowId, setCurrentFlowId] = useState<Id<"flows"> | null>(null);

  // Convex hooks
  const projects = useQuery(api.projects.getAllProjects);
  const createProjectMutation = useMutation(api.projects.createProject);
  const updateProjectMutation = useMutation(api.projects.updateProject);
  const deleteProjectMutation = useMutation(api.projects.deleteProject);
  
  // Get active flow for current project
  const activeFlow = useQuery(
    api.flows.getActiveFlow,
    currentProject ? { projectId: currentProject._id } : "skip"
  );

  // Update flow ID when active flow changes
  useEffect(() => {
    if (activeFlow) {
      setCurrentFlowId(activeFlow._id);
    } else {
      setCurrentFlowId(null);
    }
  }, [activeFlow]);

  // Load default project on app start
  useEffect(() => {
    if (projects && projects.length > 0 && !currentProject) {
      // Load the most recently modified project
      const recentProject = projects.reduce((latest, project) => 
        project.lastModified > latest.lastModified ? project : latest
      );
      setCurrentProjectState(recentProject);
    }
  }, [projects, currentProject]);

  const setCurrentProject = (project: Project) => {
    setCurrentProjectState(project);
    // Save to localStorage for persistence
    localStorage.setItem('currentProjectId', project._id);
  };

  const createProject = async (data: {
    name: string;
    description?: string;
    folder: string;
    status?: "active" | "archived" | "draft";
  }): Promise<Id<"projects">> => {
    const projectId = await createProjectMutation({
      name: data.name,
      description: data.description,
      folder: data.folder,
      status: data.status || "active",
      settings: {
        snapToGrid: true,
        showMiniMap: true,
        canvasBackground: "#ffffff",
        theme: "light",
      },
    });

    return projectId;
  };

  const updateCurrentProject = async (updates: Partial<Project>): Promise<void> => {
    if (!currentProject) return;

    await updateProjectMutation({
      projectId: currentProject._id,
      ...updates,
    });

    // Update local state
    setCurrentProjectState({
      ...currentProject,
      ...updates,
      lastModified: Date.now(),
    });
  };

  const deleteProject = async (projectId: Id<"projects">): Promise<void> => {
    await deleteProjectMutation({ projectId });
    
    // If deleting current project, clear it
    if (currentProject && currentProject._id === projectId) {
      setCurrentProjectState(null);
      setCurrentFlowId(null);
      localStorage.removeItem('currentProjectId');
    }
  };

  const value: ProjectContextType = {
    currentProject,
    currentFlowId,
    projects,
    setCurrentProject,
    createProject,
    updateCurrentProject,
    deleteProject,
    isLoadingProjects: projects === undefined,
    isLoadingCurrentFlow: activeFlow === undefined && currentProject !== null,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
} 