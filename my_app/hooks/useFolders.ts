"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

// Types matching Convex schema
export interface FolderData {
  _id: Id<"folders">;
  _creationTime: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentFolderId?: Id<"folders">;
  path: string;
  depth: number;
  isDeleted: boolean;
  deletedAt?: number;
  deletedBy?: string;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
  settings?: {
    isPrivate: boolean;
    allowSubfolders: boolean;
    defaultProjectSettings?: {
      snapToGrid: boolean;
      showMiniMap: boolean;
      canvasBackground: string;
      theme: "light" | "dark";
    };
  };
}

export interface CreateFolderArgs {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  parentFolderId?: Id<"folders">;
  settings?: {
    isPrivate: boolean;
    allowSubfolders: boolean;
    defaultProjectSettings?: {
      snapToGrid: boolean;
      showMiniMap: boolean;
      canvasBackground: string;
      theme: "light" | "dark";
    };
  };
}

export interface UseFoldersReturn {
  folders: FolderData[];
  loading: boolean;
  error: string | null;
  createFolder: (args: CreateFolderArgs) => Promise<{ success: boolean; folderId?: Id<"folders">; error?: string }>;
  updateFolder: (folderId: Id<"folders">, updates: Partial<CreateFolderArgs>) => Promise<{ success: boolean; error?: string }>;
  deleteFolder: (folderId: Id<"folders">) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Real Convex hook for folder management
 * Provides real-time synchronization with Convex backend
 */
export const useFolders = (): UseFoldersReturn => {
  console.log('🚀 useFolders Convex hook initialized');

  // Real-time queries
  const folders = useQuery(api.folders.getAllFolders) ?? [];
  const loading = folders === undefined;

  // Mutations
  const createFolderMutation = useMutation(api.folders.createFolder);
  const updateFolderMutation = useMutation(api.folders.updateFolder);
  const deleteFolderMutation = useMutation(api.folders.deleteFolder);

  // Wrapper functions with error handling
  const createFolder = async (args: CreateFolderArgs) => {
    try {
      console.log('📁 Creating folder with Convex:', args);
      const result = await createFolderMutation(args);
      
      if (result.success) {
        console.log('✅ Folder created successfully:', result.folderId);
        return { success: true, folderId: result.folderId };
      } else {
        console.error('❌ Failed to create folder:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error creating folder:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const updateFolder = async (folderId: Id<"folders">, updates: Partial<CreateFolderArgs>) => {
    try {
      console.log('📝 Updating folder with Convex:', folderId, updates);
      const result = await updateFolderMutation({ folderId, ...updates });
      
      if (result.success) {
        console.log('✅ Folder updated successfully');
        return { success: true };
      } else {
        console.error('❌ Failed to update folder:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error updating folder:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  const deleteFolder = async (folderId: Id<"folders">) => {
    try {
      console.log('🗑️ Deleting folder with Convex:', folderId);
      const result = await deleteFolderMutation({ folderId });
      
      if (result.success) {
        console.log('✅ Folder deleted successfully');
        return { success: true };
      } else {
        console.error('❌ Failed to delete folder:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Error deleting folder:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  };

  return {
    folders: folders as FolderData[],
    loading,
    error: null, // Convex handles errors through mutations
    createFolder,
    updateFolder,
    deleteFolder,
  };
}; 