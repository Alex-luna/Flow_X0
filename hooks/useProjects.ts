import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useState, useCallback, useMemo } from "react";

export interface Project {
  _id: Id<"projects">;
  name: string;
  description?: string;
  folderId?: Id<"folders">;
  status: "draft" | "active" | "archived";
  priority: "low" | "medium" | "high";
  tags: string[];
  color: string;
  isDeleted: boolean;
  deletedAt?: number;
  deletedBy?: string;
  dueDate?: number;
  completedAt?: number;
  metadata: {
    nodeCount: number;
    edgeCount: number;
    lastModified: number;
    version: number;
  };
  _creationTime: number;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  folderId?: Id<"folders">;
  status?: "draft" | "active" | "archived";
  priority?: "low" | "medium" | "high";
  tags?: string[];
  color?: string;
  dueDate?: number;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  folderId?: Id<"folders">;
  status?: "draft" | "active" | "archived";
  priority?: "low" | "medium" | "high";
  tags?: string[];
  color?: string;
  dueDate?: number;
}

export interface ProjectFilters {
  folderId?: Id<"folders">;
  status?: "draft" | "active" | "archived";
  priority?: "low" | "medium" | "high";
  tags?: string[];
  search?: string;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface ProjectSort {
  field: "name" | "createdAt" | "lastModified" | "dueDate" | "priority";
  direction: "asc" | "desc";
}

export interface ProjectStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byFolder: Record<string, number>;
  recentActivity: number;
  overdue: number;
}

export interface BulkOperation {
  type: "delete" | "archive" | "move" | "updateStatus" | "updatePriority";
  projectIds: Id<"projects">[];
  data?: any;
}

interface OptimisticProject extends Project {
  _isOptimistic?: boolean;
  _optimisticId?: string;
}

interface UseProjects {
  // Data
  projects: OptimisticProject[];
  filteredProjects: OptimisticProject[];
  recentProjects: OptimisticProject[];
  favoriteProjects: OptimisticProject[];
  stats: ProjectStats;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBulkOperating: boolean;
  
  // Error states
  error: string | null;
  retryCount: number;
  
  // Filters and sorting
  filters: ProjectFilters;
  sort: ProjectSort;
  setFilters: (filters: ProjectFilters) => void;
  setSort: (sort: ProjectSort) => void;
  clearFilters: () => void;
  
  // Selection
  selectedProjects: Set<Id<"projects">>;
  toggleSelection: (projectId: Id<"projects">) => void;
  selectAll: () => void;
  clearSelection: () => void;
  
  // Actions
  createProject: (data: CreateProjectData) => Promise<Id<"projects"> | null>;
  updateProject: (id: Id<"projects">, data: UpdateProjectData) => Promise<boolean>;
  deleteProject: (id: Id<"projects">) => Promise<boolean>;
  restoreProject: (id: Id<"projects">) => Promise<boolean>;
  duplicateProject: (id: Id<"projects">) => Promise<Id<"projects"> | null>;
  bulkOperation: (operation: BulkOperation) => Promise<boolean>;
  
  // Utilities
  getProjectById: (id: Id<"projects">) => OptimisticProject | undefined;
  getProjectsByFolder: (folderId: Id<"folders">) => OptimisticProject[];
  validateProjectName: (name: string) => string | null;
  
  // Retry mechanism
  retry: () => void;
  clearError: () => void;
}

const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 1000;

export function useProjects(): UseProjects {
  // State management
  const [optimisticProjects, setOptimisticProjects] = useState<OptimisticProject[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkOperating, setIsBulkOperating] = useState(false);
  
  // Filters and sorting
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [sort, setSort] = useState<ProjectSort>({
    field: "lastModified",
    direction: "desc"
  });
  
  // Selection
  const [selectedProjects, setSelectedProjects] = useState<Set<Id<"projects">>>(new Set());

  // Convex queries and mutations
  const projectsQuery = useQuery(api.projects.list);
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const deleteProjectMutation = useMutation(api.projects.delete);
  const restoreProjectMutation = useMutation(api.projects.restore);
  const duplicateProjectMutation = useMutation(api.projects.duplicate);

  // Combine real and optimistic data
  const projects = useMemo(() => {
    const realProjects = projectsQuery || [];
    const combined = [...realProjects, ...optimisticProjects];
    
    // Remove duplicates (optimistic projects that became real)
    const uniqueProjects = combined.filter((project, index, arr) => 
      arr.findIndex(p => p._id === project._id) === index
    );
    
    return uniqueProjects;
  }, [projectsQuery, optimisticProjects]);

  const isLoading = projectsQuery === undefined;

  // Error handling with retry
  const handleError = useCallback((error: any, operation: string) => {
    console.error(`❌ Project ${operation} failed:`, error);
    const errorMessage = error?.message || `Failed to ${operation} project`;
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
    setOptimisticProjects([]);
  }, []);

  // Create project with optimistic update
  const createProject = useCallback(async (data: CreateProjectData): Promise<Id<"projects"> | null> => {
    setIsCreating(true);
    clearError();
    
    // Validate name
    const validation = validateProjectName(data.name);
    if (validation) {
      setError(validation);
      setIsCreating(false);
      return null;
    }

    // Create optimistic project
    const optimisticId = `temp_${Date.now()}` as Id<"projects">;
    const optimisticProject: OptimisticProject = {
      _id: optimisticId,
      name: data.name,
      description: data.description,
      folderId: data.folderId,
      status: data.status || "draft",
      priority: data.priority || "medium",
      tags: data.tags || [],
      color: data.color || "#3B82F6",
      isDeleted: false,
      dueDate: data.dueDate,
      metadata: {
        nodeCount: 0,
        edgeCount: 0,
        lastModified: Date.now(),
        version: 1,
      },
      _creationTime: Date.now(),
      _isOptimistic: true,
      _optimisticId: optimisticId,
    };

    setOptimisticProjects(prev => [...prev, optimisticProject]);

    try {
      const result = await createProjectMutation(data);
      
      // Remove optimistic project
      setOptimisticProjects(prev => prev.filter(p => p._id !== optimisticId));
      setIsCreating(false);
      
      return result;
    } catch (error) {
      // Remove optimistic project on error
      setOptimisticProjects(prev => prev.filter(p => p._id !== optimisticId));
      handleError(error, 'create');
      setIsCreating(false);
      return null;
    }
  }, [createProjectMutation, handleError, clearError]);

  // Update project with optimistic update
  const updateProject = useCallback(async (id: Id<"projects">, data: UpdateProjectData): Promise<boolean> => {
    setIsUpdating(true);
    clearError();

    // Validate name if provided
    if (data.name) {
      const validation = validateProjectName(data.name);
      if (validation) {
        setError(validation);
        setIsUpdating(false);
        return false;
      }
    }

    // Create optimistic update
    const originalProject = getProjectById(id);
    if (originalProject && !originalProject._isOptimistic) {
      setOptimisticProjects(prev => {
        const updated = prev.map(p => 
          p._id === id ? { 
            ...p, 
            ...data,
            metadata: {
              ...p.metadata,
              lastModified: Date.now(),
              version: p.metadata.version + 1,
            }
          } : p
        );
        
        // If not in optimistic list, add updated version
        if (!prev.find(p => p._id === id)) {
          updated.push({ 
            ...originalProject, 
            ...data,
            metadata: {
              ...originalProject.metadata,
              lastModified: Date.now(),
              version: originalProject.metadata.version + 1,
            },
            _isOptimistic: true 
          });
        }
        
        return updated;
      });
    }

    try {
      await updateProjectMutation({ id, ...data });
      
      // Remove optimistic update
      setOptimisticProjects(prev => prev.filter(p => p._id !== id || !p._isOptimistic));
      setIsUpdating(false);
      
      return true;
    } catch (error) {
      // Revert optimistic update
      setOptimisticProjects(prev => prev.filter(p => p._id !== id || !p._isOptimistic));
      handleError(error, 'update');
      setIsUpdating(false);
      return false;
    }
  }, [updateProjectMutation, handleError, clearError]);

  // Delete project with optimistic update
  const deleteProject = useCallback(async (id: Id<"projects">): Promise<boolean> => {
    setIsDeleting(true);
    clearError();

    // Optimistically hide project
    const originalProject = getProjectById(id);
    if (originalProject && !originalProject._isOptimistic) {
      setOptimisticProjects(prev => {
        const updated = prev.map(p => 
          p._id === id ? { ...p, isDeleted: true, deletedAt: Date.now() } : p
        );
        
        // If not in optimistic list, add deleted version
        if (!prev.find(p => p._id === id)) {
          updated.push({ 
            ...originalProject, 
            isDeleted: true, 
            deletedAt: Date.now(),
            _isOptimistic: true 
          });
        }
        
        return updated;
      });
    }

    try {
      await deleteProjectMutation({ id });
      
      // Remove optimistic update
      setOptimisticProjects(prev => prev.filter(p => p._id !== id || !p._isOptimistic));
      setIsDeleting(false);
      
      return true;
    } catch (error) {
      // Revert optimistic update
      setOptimisticProjects(prev => prev.filter(p => p._id !== id || !p._isOptimistic));
      handleError(error, 'delete');
      setIsDeleting(false);
      return false;
    }
  }, [deleteProjectMutation, handleError, clearError]);

  // Restore project
  const restoreProject = useCallback(async (id: Id<"projects">): Promise<boolean> => {
    setIsUpdating(true);
    clearError();

    try {
      await restoreProjectMutation({ id });
      setIsUpdating(false);
      return true;
    } catch (error) {
      handleError(error, 'restore');
      setIsUpdating(false);
      return false;
    }
  }, [restoreProjectMutation, handleError, clearError]);

  // Duplicate project
  const duplicateProject = useCallback(async (id: Id<"projects">): Promise<Id<"projects"> | null> => {
    setIsCreating(true);
    clearError();

    try {
      const result = await duplicateProjectMutation({ id });
      setIsCreating(false);
      return result;
    } catch (error) {
      handleError(error, 'duplicate');
      setIsCreating(false);
      return null;
    }
  }, [duplicateProjectMutation, handleError, clearError]);

  // Bulk operations
  const bulkOperation = useCallback(async (operation: BulkOperation): Promise<boolean> => {
    setIsBulkOperating(true);
    clearError();

    try {
      // Handle different bulk operations
      switch (operation.type) {
        case "delete":
          await Promise.all(
            operation.projectIds.map(id => deleteProjectMutation({ id }))
          );
          break;
        case "updateStatus":
          await Promise.all(
            operation.projectIds.map(id => 
              updateProjectMutation({ id, status: operation.data.status })
            )
          );
          break;
        case "updatePriority":
          await Promise.all(
            operation.projectIds.map(id => 
              updateProjectMutation({ id, priority: operation.data.priority })
            )
          );
          break;
        case "move":
          await Promise.all(
            operation.projectIds.map(id => 
              updateProjectMutation({ id, folderId: operation.data.folderId })
            )
          );
          break;
        default:
          throw new Error(`Unsupported bulk operation: ${operation.type}`);
      }
      
      setIsBulkOperating(false);
      clearSelection();
      return true;
    } catch (error) {
      handleError(error, `bulk ${operation.type}`);
      setIsBulkOperating(false);
      return false;
    }
  }, [deleteProjectMutation, updateProjectMutation, handleError, clearError]);

  // Utility functions
  const getProjectById = useCallback((id: Id<"projects">) => {
    return projects.find(p => p._id === id);
  }, [projects]);

  const getProjectsByFolder = useCallback((folderId: Id<"folders">) => {
    return projects.filter(p => p.folderId === folderId && !p.isDeleted);
  }, [projects]);

  const validateProjectName = useCallback((name: string) => {
    if (!name.trim()) {
      return "Project name is required";
    }
    
    if (name.length > 100) {
      return "Project name must be less than 100 characters";
    }
    
    return null;
  }, []);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(p => !p.isDeleted);
    
    // Apply filters
    if (filters.folderId) {
      filtered = filtered.filter(p => p.folderId === filters.folderId);
    }
    
    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(p => p.priority === filters.priority);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(p => 
        filters.tags!.some(tag => p.tags.includes(tag))
      );
    }
    
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    if (filters.dateRange) {
      filtered = filtered.filter(p =>
        p._creationTime >= filters.dateRange!.start &&
        p._creationTime <= filters.dateRange!.end
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sort.field) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "createdAt":
          aValue = a._creationTime;
          bValue = b._creationTime;
          break;
        case "lastModified":
          aValue = a.metadata.lastModified;
          bValue = b.metadata.lastModified;
          break;
        case "dueDate":
          aValue = a.dueDate || 0;
          bValue = b.dueDate || 0;
          break;
        case "priority":
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        default:
          aValue = a._creationTime;
          bValue = b._creationTime;
      }
      
      if (sort.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [projects, filters, sort]);

  // Recent projects (last 7 days)
  const recentProjects = useMemo(() => {
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return projects
      .filter(p => !p.isDeleted && p.metadata.lastModified > sevenDaysAgo)
      .sort((a, b) => b.metadata.lastModified - a.metadata.lastModified)
      .slice(0, 10);
  }, [projects]);

  // Mock favorite projects (could be extended with user preferences)
  const favoriteProjects = useMemo(() => {
    return projects
      .filter(p => !p.isDeleted)
      .sort((a, b) => b.metadata.lastModified - a.metadata.lastModified)
      .slice(0, 5);
  }, [projects]);

  // Calculate stats
  const stats = useMemo((): ProjectStats => {
    const activeProjects = projects.filter(p => !p.isDeleted);
    const now = Date.now();
    
    return {
      total: activeProjects.length,
      byStatus: activeProjects.reduce((acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byPriority: activeProjects.reduce((acc, p) => {
        acc[p.priority] = (acc[p.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byFolder: activeProjects.reduce((acc, p) => {
        const key = p.folderId || "root";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentActivity: Math.max(...activeProjects.map(p => p.metadata.lastModified), 0),
      overdue: activeProjects.filter(p => p.dueDate && p.dueDate < now && p.status !== "archived").length,
    };
  }, [projects]);

  // Selection management
  const toggleSelection = useCallback((projectId: Id<"projects">) => {
    setSelectedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedProjects(new Set(filteredProjects.map(p => p._id)));
  }, [filteredProjects]);

  const clearSelection = useCallback(() => {
    setSelectedProjects(new Set());
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return {
    // Data
    projects: projects.filter(p => !p.isDeleted),
    filteredProjects,
    recentProjects,
    favoriteProjects,
    stats,
    
    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isBulkOperating,
    
    // Error states
    error,
    retryCount,
    
    // Filters and sorting
    filters,
    sort,
    setFilters,
    setSort,
    clearFilters,
    
    // Selection
    selectedProjects,
    toggleSelection,
    selectAll,
    clearSelection,
    
    // Actions
    createProject,
    updateProject,
    deleteProject,
    restoreProject,
    duplicateProject,
    bulkOperation,
    
    // Utilities
    getProjectById,
    getProjectsByFolder,
    validateProjectName,
    
    // Retry mechanism
    retry,
    clearError,
  };
} 