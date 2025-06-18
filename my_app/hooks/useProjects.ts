"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Types matching Convex schema
export interface ProjectData {
  _id: Id<"projects">;
  _creationTime: number;
  name: string;
  description?: string;
  folderId?: Id<"folders">;
  folderPath?: string;
  status: "active" | "archived" | "draft";
  tags?: string[];
  priority?: "low" | "medium" | "high";
  dueDate?: number;
  isDeleted: boolean;
  deletedAt?: number;
  deletedBy?: string;
  createdBy?: string;
  lastModified: number;
  lastModifiedBy?: string;
  accessedAt: number;
  settings?: {
    snapToGrid: boolean;
    showMiniMap: boolean;
    canvasBackground: string;
    theme: "light" | "dark";
    isPublic: boolean;
    allowComments: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
  };
  stats?: {
    nodeCount: number;
    edgeCount: number;
    lastFlowModified: number;
    totalEditTime: number;
    viewCount: number;
  };
}

export interface CreateProjectArgs {
  name: string;
  description?: string;
  folderId?: Id<"folders">;
  status?: "active" | "archived" | "draft";
  tags?: string[];
  priority?: "low" | "medium" | "high";
  dueDate?: number;
  createdBy?: string;
  settings?: {
    snapToGrid: boolean;
    showMiniMap: boolean;
    canvasBackground: string;
    theme: "light" | "dark";
    isPublic: boolean;
    allowComments: boolean;
    autoSave: boolean;
    autoSaveInterval: number;
  };
}

export interface UseProjectsReturn {
  projects: ProjectData[];
  loading: boolean;
  error: string | null;
  createProject: (args: CreateProjectArgs) => Promise<{ success: boolean; projectId?: Id<"projects">; error?: string }>;
  updateProject: (projectId: Id<"projects">, updates: Partial<CreateProjectArgs>) => Promise<{ success: boolean; error?: string }>;
  deleteProject: (projectId: Id<"projects">) => Promise<{ success: boolean; error?: string }>;
  getProjectsByFolder: (folderId?: Id<"folders">) => ProjectData[];
}

/**
 * Real Convex hook for project management
 * Provides real-time synchronization with Convex backend
 */
export const useProjects = (): UseProjectsReturn => {
  console.log('🚀 useProjects Convex hook initialized');

  // Real-time queries
  const projects = useQuery(api.projects.getAllProjects) ?? [];
  const loading = projects === undefined;

  // Mutations
  const createProjectMutation = useMutation(api.projects.createProject);
  const updateProjectMutation = useMutation(api.projects.updateProject);
  const deleteProjectMutation = useMutation(api.projects.deleteProject);

  // Wrapper functions with error handling
  const createProject = async (args: CreateProjectArgs) => {
    try {
      console.log('📊 Creating project with Convex:', args);
      const result = await createProjectMutation(args);
      
      if (result.success) {
        console.log('✅ Project created successfully:', result.projectId);
        return { success: true, projectId: result.projectId };
      } else {
        console.error('❌ Failed to create project:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error creating project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const updateProject = async (projectId: Id<"projects">, updates: Partial<CreateProjectArgs>) => {
    try {
      console.log('📝 Updating project with Convex:', projectId, updates);
      const result = await updateProjectMutation({ projectId, ...updates });
      
      if (result.success) {
        console.log('✅ Project updated successfully');
        return { success: true };
      } else {
        console.error('❌ Failed to update project:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error updating project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const deleteProject = async (projectId: Id<"projects">) => {
    try {
      console.log('🗑️ Deleting project with Convex:', projectId);
      const result = await deleteProjectMutation({ projectId });
      
      if (result.success) {
        console.log('✅ Project deleted successfully');
        return { success: true };
      } else {
        console.error('❌ Failed to delete project:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error deleting project:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  // Helper function to filter projects by folder
  const getProjectsByFolder = (folderId?: Id<"folders">): ProjectData[] => {
    return projects.filter((project: ProjectData) => project.folderId === folderId) as ProjectData[];
  };

  return {
    projects: projects as ProjectData[],
    loading,
    error: null, // Convex handles errors through mutations
    createProject,
    updateProject,
    deleteProject,
    getProjectsByFolder,
  };
}; 