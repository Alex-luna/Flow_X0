import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState, useCallback, useMemo } from "react";

export interface Folder {
  _id: Id<"folders">;
  name: string;
  color: string;
  parentId?: Id<"folders">;
  path: string;
  depth: number;
  isDeleted: boolean;
  deletedAt?: number;
  deletedBy?: string;
  _creationTime: number;
  projectCount?: number;
  subfolderCount?: number;
  lastActivity?: number;
}

export interface CreateFolderData {
  name: string;
  color: string;
  parentId?: Id<"folders">;
}

export interface UpdateFolderData {
  name?: string;
  color?: string;
  parentId?: Id<"folders">;
}

export interface FolderTreeNode extends Folder {
  children: FolderTreeNode[];
  isExpanded: boolean;
}

export interface FolderStats {
  totalFolders: number;
  totalProjects: number;
  recentActivity: number;
  foldersByDepth: Record<number, number>;
}

interface OptimisticFolder extends Folder {
  _isOptimistic?: boolean;
  _optimisticId?: string;
}

interface UseFolder {
  // Data
  folders: OptimisticFolder[];
  folderTree: FolderTreeNode[];
  stats: FolderStats;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: string | null;
  retryCount: number;
  
  // Actions
  createFolder: (data: CreateFolderData) => Promise<Id<"folders"> | null>;
  updateFolder: (id: Id<"folders">, data: UpdateFolderData) => Promise<boolean>;
  deleteFolder: (id: Id<"folders">) => Promise<boolean>;
  restoreFolder: (id: Id<"folders">) => Promise<boolean>;
  
  // Utilities
  getFolderById: (id: Id<"folders">) => OptimisticFolder | undefined;
  getFolderByPath: (path: string) => OptimisticFolder | undefined;
  buildFolderPath: (parentId?: Id<"folders">) => string;
  validateFolderName: (name: string, parentId?: Id<"folders">) => string | null;
  
  // Tree management
  toggleExpanded: (folderId: Id<"folders">) => void;
  expandedFolders: Set<Id<"folders">>;
  
  // Retry mechanism
  retry: () => void;
  clearError: () => void;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

export function useFolders(): UseFolder {
  // State management
  const [expandedFolders, setExpandedFolders] = useState<Set<Id<"folders">>>(new Set());
  const [optimisticFolders, setOptimisticFolders] = useState<OptimisticFolder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Convex queries and mutations
  const foldersQuery = useQuery(api.folders.list);
  const createFolderMutation = useMutation(api.folders.create);
  const updateFolderMutation = useMutation(api.folders.update);
  const deleteFolderMutation = useMutation(api.folders.delete);
  const restoreFolderMutation = useMutation(api.folders.restore);

  // Combine real and optimistic data
  const folders = useMemo(() => {
    const realFolders = foldersQuery || [];
    const combined = [...realFolders, ...optimisticFolders];
    
    // Remove duplicates (optimistic folders that became real)
    const uniqueFolders = combined.filter((folder, index, arr) => 
      arr.findIndex(f => f._id === folder._id) === index
    );
    
    return uniqueFolders;
  }, [foldersQuery, optimisticFolders]);

  const isLoading = foldersQuery === undefined;

  // Error handling with retry
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`❌ Folder ${operation} failed:`, error);
    const errorMessage = error?.message || `Failed to ${operation} folder`;
    setError(errorMessage);
    
    if (retryCount < MAX_RETRY_COUNT) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setError(null);
      }, RETRY_DELAY * (retryCount + 1));
    }
  }, [retryCount]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const retry = useCallback(() => {
    setError(null);
    setRetryCount(0);
    // Trigger a refetch by clearing optimistic state
    setOptimisticFolders([]);
  }, []);

  // Create folder with optimistic update
  const createFolder = useCallback(async (data: CreateFolderData): Promise<Id<"folders"> | null> => {
    setIsCreating(true);
    clearError();
    
    // Validate name
    const validation = validateFolderName(data.name, data.parentId);
    if (validation) {
      setError(validation);
      setIsCreating(false);
      return null;
    }

    // Create optimistic folder
    const optimisticId = `temp_${Date.now()}` as Id<"folders">;
    const parentPath = data.parentId ? getFolderById(data.parentId)?.path || "" : "";
    const optimisticFolder: OptimisticFolder = {
      _id: optimisticId,
      name: data.name,
      color: data.color,
      parentId: data.parentId,
      path: parentPath ? `${parentPath}/${data.name}` : data.name,
      depth: parentPath ? parentPath.split('/').length : 0,
      isDeleted: false,
      _creationTime: Date.now(),
      projectCount: 0,
      subfolderCount: 0,
      _isOptimistic: true,
      _optimisticId: optimisticId,
    };

    setOptimisticFolders(prev => [...prev, optimisticFolder]);

    try {
      const result = await createFolderMutation(data);
      
      // Remove optimistic folder
      setOptimisticFolders(prev => prev.filter(f => f._id !== optimisticId));
      setIsCreating(false);
      
      return result;
    } catch (error) {
      // Remove optimistic folder on error
      setOptimisticFolders(prev => prev.filter(f => f._id !== optimisticId));
      handleError(error, 'create');
      setIsCreating(false);
      return null;
    }
  }, [createFolderMutation, handleError, clearError]);

  // Update folder with optimistic update
  const updateFolder = useCallback(async (id: Id<"folders">, data: UpdateFolderData): Promise<boolean> => {
    setIsUpdating(true);
    clearError();

    // Validate name if provided
    if (data.name) {
      const currentFolder = getFolderById(id);
      const validation = validateFolderName(data.name, currentFolder?.parentId);
      if (validation) {
        setError(validation);
        setIsUpdating(false);
        return false;
      }
    }

    // Create optimistic update
    const originalFolder = getFolderById(id);
    if (originalFolder && !originalFolder._isOptimistic) {
      setOptimisticFolders(prev => {
        const updated = prev.map(f => 
          f._id === id ? { ...f, ...data } : f
        );
        
        // If not in optimistic list, add updated version
        if (!prev.find(f => f._id === id)) {
          updated.push({ ...originalFolder, ...data, _isOptimistic: true });
        }
        
        return updated;
      });
    }

    try {
      await updateFolderMutation({ id, ...data });
      
      // Remove optimistic update
      setOptimisticFolders(prev => prev.filter(f => f._id !== id || !f._isOptimistic));
      setIsUpdating(false);
      
      return true;
    } catch (error) {
      // Revert optimistic update
      setOptimisticFolders(prev => prev.filter(f => f._id !== id || !f._isOptimistic));
      handleError(error, 'update');
      setIsUpdating(false);
      return false;
    }
  }, [updateFolderMutation, handleError, clearError]);

  // Delete folder with optimistic update
  const deleteFolder = useCallback(async (id: Id<"folders">): Promise<boolean> => {
    setIsDeleting(true);
    clearError();

    // Optimistically hide folder
    const originalFolder = getFolderById(id);
    if (originalFolder && !originalFolder._isOptimistic) {
      setOptimisticFolders(prev => {
        const updated = prev.map(f => 
          f._id === id ? { ...f, isDeleted: true, deletedAt: Date.now() } : f
        );
        
        // If not in optimistic list, add deleted version
        if (!prev.find(f => f._id === id)) {
          updated.push({ 
            ...originalFolder, 
            isDeleted: true, 
            deletedAt: Date.now(),
            _isOptimistic: true 
          });
        }
        
        return updated;
      });
    }

    try {
      await deleteFolderMutation({ id });
      
      // Remove optimistic update
      setOptimisticFolders(prev => prev.filter(f => f._id !== id || !f._isOptimistic));
      setIsDeleting(false);
      
      return true;
    } catch (error) {
      // Revert optimistic update
      setOptimisticFolders(prev => prev.filter(f => f._id !== id || !f._isOptimistic));
      handleError(error, 'delete');
      setIsDeleting(false);
      return false;
    }
  }, [deleteFolderMutation, handleError, clearError]);

  // Restore folder
  const restoreFolder = useCallback(async (id: Id<"folders">): Promise<boolean> => {
    setIsUpdating(true);
    clearError();

    try {
      await restoreFolderMutation({ id });
      setIsUpdating(false);
      return true;
    } catch (error) {
      handleError(error, 'restore');
      setIsUpdating(false);
      return false;
    }
  }, [restoreFolderMutation, handleError, clearError]);

  // Utility functions
  const getFolderById = useCallback((id: Id<"folders">) => {
    return folders.find(f => f._id === id);
  }, [folders]);

  const getFolderByPath = useCallback((path: string) => {
    return folders.find(f => f.path === path);
  }, [folders]);

  const buildFolderPath = useCallback((parentId?: Id<"folders">) => {
    if (!parentId) return "";
    const parent = getFolderById(parentId);
    return parent ? parent.path : "";
  }, [getFolderById]);

  const validateFolderName = useCallback((name: string, parentId?: Id<"folders">) => {
    if (!name.trim()) {
      return "Folder name is required";
    }
    
    if (name.length > 50) {
      return "Folder name must be less than 50 characters";
    }
    
    if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
      return "Folder name can only contain letters, numbers, spaces, hyphens, and underscores";
    }
    
    // Check for duplicate names in the same parent
    const siblings = folders.filter(f => 
      f.parentId === parentId && 
      !f.isDeleted &&
      f.name.toLowerCase() === name.toLowerCase().trim()
    );
    
    if (siblings.length > 0) {
      return "A folder with this name already exists in the same location";
    }
    
    return null;
  }, [folders]);

  // Build folder tree
  const folderTree = useMemo(() => {
    const activeFolders = folders.filter(f => !f.isDeleted);
    const folderMap = new Map<Id<"folders">, FolderTreeNode>();
    
    // Create tree nodes
    activeFolders.forEach(folder => {
      folderMap.set(folder._id, {
        ...folder,
        children: [],
        isExpanded: expandedFolders.has(folder._id),
      });
    });
    
    // Build tree structure
    const rootFolders: FolderTreeNode[] = [];
    
    folderMap.forEach(node => {
      if (node.parentId) {
        const parent = folderMap.get(node.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          rootFolders.push(node);
        }
      } else {
        rootFolders.push(node);
      }
    });
    
    // Sort folders by name
    const sortFolders = (folders: FolderTreeNode[]) => {
      folders.sort((a, b) => a.name.localeCompare(b.name));
      folders.forEach(folder => sortFolders(folder.children));
    };
    
    sortFolders(rootFolders);
    return rootFolders;
  }, [folders, expandedFolders]);

  // Calculate stats
  const stats = useMemo((): FolderStats => {
    const activeFolders = folders.filter(f => !f.isDeleted);
    
    return {
      totalFolders: activeFolders.length,
      totalProjects: activeFolders.reduce((sum, f) => sum + (f.projectCount || 0), 0),
      recentActivity: Math.max(...activeFolders.map(f => f.lastActivity || 0), 0),
      foldersByDepth: activeFolders.reduce((acc, f) => {
        acc[f.depth] = (acc[f.depth] || 0) + 1;
        return acc;
      }, {} as Record<number, number>),
    };
  }, [folders]);

  // Toggle expanded state
  const toggleExpanded = useCallback((folderId: Id<"folders">) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  }, []);

  return {
    // Data
    folders: folders.filter(f => !f.isDeleted),
    folderTree,
    stats,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Error states
    error,
    retryCount,
    
    // Actions
    createFolder,
    updateFolder,
    deleteFolder,
    restoreFolder,
    
    // Utilities
    getFolderById,
    getFolderByPath,
    buildFolderPath,
    validateFolderName,
    
    // Tree management
    toggleExpanded,
    expandedFolders,
    
    // Retry mechanism
    retry,
    clearError,
  };
} 