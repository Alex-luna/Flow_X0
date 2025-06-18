import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Node, Edge } from 'reactflow';

interface UseProjectSyncProps {
  projectId?: Id<"projects">;
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  autoSaveDelay?: number;
}

interface UseProjectSync {
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isLoadingFlow: boolean;
  
  // Error states
  error: string | null;
  saveError: string | null;
  
  // Actions
  saveFlow: () => Promise<boolean>;
  loadFlow: (projectId: Id<"projects">) => Promise<boolean>;
  resetCanvas: () => void;
  
  // Status
  lastSaved: number | null;
  hasUnsavedChanges: boolean;
  
  // Auto-save control
  enableAutoSave: () => void;
  disableAutoSave: () => void;
  isAutoSaveEnabled: boolean;
}

const DEFAULT_AUTO_SAVE_DELAY = 2000; // 2 seconds

export function useProjectSync({
  projectId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  autoSaveDelay = DEFAULT_AUTO_SAVE_DELAY
}: UseProjectSyncProps): UseProjectSync {
  // Refs for tracking state
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<number | null>(null);
  const isAutoSaveEnabledRef = useRef(true);
  const lastSaveDataRef = useRef<string>('');
  
  // Convex queries and mutations
  const flowQuery = useQuery(
    projectId ? api.flows.getActiveFlow : "skip",
    projectId ? { projectId } : undefined
  );
  const saveFlowMutation = useMutation(api.flows.saveFlowData);
  const updateProjectMutation = useMutation(api.projects.updateProjectStats);

  const isLoading = flowQuery === undefined;
  const isLoadingFlow = isLoading;

  // Calculate if there are unsaved changes
  const currentDataString = JSON.stringify({ nodes, edges });
  const hasUnsavedChanges = currentDataString !== lastSaveDataRef.current;

  // Save flow to backend
  const saveFlow = useCallback(async (): Promise<boolean> => {
    if (!projectId) {
      console.warn('No project ID provided for saving');
      return false;
    }

    try {
      const flowData = {
        nodes: nodes.map((node: any) => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: node.data,
          width: node.width,
          height: node.height,
          selected: node.selected || false,
          dragging: node.dragging || false,
        })),
        edges: edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type || 'default',
          animated: edge.animated || false,
          data: edge.data,
        })),
      };

      // Save flow data
      await saveFlowMutation({
        projectId,
        nodes: flowData.nodes,
        edges: flowData.edges,
        viewport: { x: 0, y: 0, zoom: 1 }, // Default viewport
      });

      // Update project stats
      await updateProjectMutation({
        projectId,
        nodeCount: nodes.length,
        edgeCount: edges.length,
      });

      // Update tracking
      lastSavedRef.current = Date.now();
      lastSaveDataRef.current = currentDataString;
      
      console.log('✅ Flow saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to save flow:', error);
      return false;
    }
  }, [projectId, nodes, edges, saveFlowMutation, updateProjectMutation, currentDataString]);

  // Load flow from backend
  const loadFlow = useCallback(async (newProjectId: Id<"projects">): Promise<boolean> => {
    try {
      // Clear current canvas
      onNodesChange([]);
      onEdgesChange([]);

      // Wait a bit for the query to update
      await new Promise(resolve => setTimeout(resolve, 100));

      return true;
    } catch (error) {
      console.error('❌ Failed to load flow:', error);
      return false;
    }
  }, [onNodesChange, onEdgesChange]);

  // Reset canvas
  const resetCanvas = useCallback(() => {
    onNodesChange([]);
    onEdgesChange([]);
    lastSaveDataRef.current = JSON.stringify({ nodes: [], edges: [] });
  }, [onNodesChange, onEdgesChange]);

  // Auto-save functionality
  const scheduleAutoSave = useCallback(() => {
    if (!isAutoSaveEnabledRef.current || !projectId || !hasUnsavedChanges) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Schedule new save
    autoSaveTimeoutRef.current = setTimeout(() => {
      saveFlow();
    }, autoSaveDelay);
  }, [projectId, hasUnsavedChanges, saveFlow, autoSaveDelay]);

  // Auto-save control
  const enableAutoSave = useCallback(() => {
    isAutoSaveEnabledRef.current = true;
  }, []);

  const disableAutoSave = useCallback(() => {
    isAutoSaveEnabledRef.current = false;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  }, []);

  // Load flow data when query updates
  useEffect(() => {
    if (flowQuery && projectId) {
      const flowNodes = flowQuery.nodes || [];
      const flowEdges = flowQuery.edges || [];

      // Convert to React Flow format
      const reactFlowNodes: Node[] = flowNodes.map((node: any) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
        width: node.width,
        height: node.height,
        selected: node.selected,
        dragging: node.dragging,
      }));

      const reactFlowEdges: Edge[] = flowEdges.map((edge: any) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        animated: edge.animated,
        data: edge.data,
      }));

      // Update canvas
      onNodesChange(reactFlowNodes);
      onEdgesChange(reactFlowEdges);

      // Update tracking
      const dataString = JSON.stringify({ 
        nodes: reactFlowNodes, 
        edges: reactFlowEdges 
      });
      lastSaveDataRef.current = dataString;
      lastSavedRef.current = flowQuery._creationTime || Date.now();

      console.log(`📄 Loaded flow for project ${projectId}:`, {
        nodes: reactFlowNodes.length,
        edges: reactFlowEdges.length
      });
    }
  }, [flowQuery, projectId, onNodesChange, onEdgesChange]);

  // Auto-save when nodes or edges change
  useEffect(() => {
    scheduleAutoSave();
  }, [scheduleAutoSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && projectId) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, projectId]);

  return {
    // Loading states
    isLoading,
    isSaving: false, // TODO: Track saving state
    isLoadingFlow,
    
    // Error states
    error: null, // TODO: Track errors
    saveError: null, // TODO: Track save errors
    
    // Actions
    saveFlow,
    loadFlow,
    resetCanvas,
    
    // Status
    lastSaved: lastSavedRef.current,
    hasUnsavedChanges,
    
    // Auto-save control
    enableAutoSave,
    disableAutoSave,
    isAutoSaveEnabled: isAutoSaveEnabledRef.current,
  };
} 