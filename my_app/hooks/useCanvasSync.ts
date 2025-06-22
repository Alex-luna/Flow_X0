"use client";

import { useState, useEffect, useCallback } from "react";
import { Node, Edge, Viewport } from "reactflow";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useProject } from "../contexts/ProjectContext";

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export interface CanvasSyncState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  isLoading: boolean;
  isLoaded: boolean;
  lastSaveTime: Date | null;
  hasUnsavedChanges: boolean;
  saveStatus: SaveStatus;
}

export function useCanvasSync(autoSaveDelay: number = 2000) {
  const { currentProject } = useProject();
  
  // Local state for canvas data
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeFlowId, setActiveFlowId] = useState<Id<"flows"> | null>(null);

  // Convex queries and mutations
  const completeFlowData = useQuery(
    api.flows.getCompleteFlowSimple, 
    currentProject ? { projectId: currentProject.id as Id<"projects"> } : "skip"
  );
  
  const saveBatchFlowData = useMutation(api.flows.saveBatchFlowData);
  const createFlowMutation = useMutation(api.flows.createFlow);

  // Load flow data when project changes
  useEffect(() => {
    if (!currentProject) {
      // Clear canvas when no project selected
      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
      setActiveFlowId(null);
      setIsLoaded(false);
      return;
    }

    if (completeFlowData === undefined) {
      // Still loading
      setIsLoading(true);
      return;
    }

    setIsLoading(false);

    if (completeFlowData === null) {
      // No flow exists for this project, create one
      console.log('🆕 Creating new flow for project:', currentProject.name);
      
      createFlowMutation({
        projectId: currentProject.id as Id<"projects">,
        name: `${currentProject.name} Flow`,
        description: `Main flow for ${currentProject.name}`,
      }).then((flowId) => {
        console.log('✅ Created new flow:', flowId);
        setActiveFlowId(flowId);
        setNodes([]);
        setEdges([]);
        setViewport({ x: 0, y: 0, zoom: 1 });
        setIsLoaded(true);
        setLastSaveTime(new Date());
        setSaveStatus('saved');
      }).catch((error) => {
        console.error('❌ Failed to create flow:', error);
      });
    } else {
      // Load existing flow data
      console.log('📂 Loading flow data for project:', currentProject.name);
      
      setActiveFlowId(completeFlowData.flowId);
      
      // Convert Convex data to ReactFlow format
      const reactFlowNodes: Node[] = completeFlowData.nodes.map(node => ({
        id: node.id,
        type: 'custom',
        position: node.position,
        data: node.data,
      }));

      const reactFlowEdges: Edge[] = completeFlowData.edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        animated: edge.animated || true,
      }));

      setNodes(reactFlowNodes);
      setEdges(reactFlowEdges);
      setViewport(completeFlowData.viewport);
      setIsLoaded(true);
      setLastSaveTime(new Date(completeFlowData.lastModified));
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      console.log('✅ Loaded flow data:', {
        nodes: reactFlowNodes.length,
        edges: reactFlowEdges.length,
        viewport: completeFlowData.viewport
      });
    }
  }, [currentProject, completeFlowData, createFlowMutation]);

  // Save to Convex
  const saveToConvex = useCallback(async () => {
    if (!activeFlowId || !currentProject) {
      console.log('⚠️ Skipping save: no flow or project');
      return;
    }

    try {
      console.log('💾 Saving to Convex...', { 
        flowId: activeFlowId,
        projectId: currentProject.id,
        nodes: nodes.length, 
        edges: edges.length 
      });

      setSaveStatus('saving');
      setIsLoading(true);

             // Convert ReactFlow data to Convex format
       const convexNodes = nodes.map(node => ({
         nodeId: node.id,
         type: node.type || 'custom',
         position: node.position,
         data: node.data,
         style: node.style ? {
           width: typeof node.style.width === 'number' ? node.style.width : undefined,
           height: typeof node.style.height === 'number' ? node.style.height : undefined,
           backgroundColor: typeof node.style.backgroundColor === 'string' ? node.style.backgroundColor : undefined,
           borderColor: typeof node.style.borderColor === 'string' ? node.style.borderColor : undefined,
         } : undefined,
         selected: node.selected,
         dragging: node.dragging,
       }));

       const convexEdges = edges.map(edge => ({
         edgeId: edge.id,
         source: edge.source,
         target: edge.target,
         sourceHandle: edge.sourceHandle || undefined,
         targetHandle: edge.targetHandle || undefined,
         type: edge.type,
         animated: edge.animated,
         style: edge.style ? {
           stroke: typeof edge.style.stroke === 'string' ? edge.style.stroke : undefined,
           strokeWidth: typeof edge.style.strokeWidth === 'number' ? edge.style.strokeWidth : undefined,
           strokeDasharray: typeof edge.style.strokeDasharray === 'string' ? edge.style.strokeDasharray : undefined,
         } : undefined,
         label: typeof edge.label === 'string' ? edge.label : undefined,
       }));

      await saveBatchFlowData({
        flowId: activeFlowId,
        nodes: convexNodes,
        edges: convexEdges,
        viewport,
      });

      setLastSaveTime(new Date());
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      console.log('✅ Saved to Convex successfully');
    } catch (error) {
      console.error('❌ Save to Convex failed:', error);
      setSaveStatus('error');
    } finally {
      setIsLoading(false);
    }
  }, [activeFlowId, currentProject, nodes, edges, viewport, saveBatchFlowData]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!activeFlowId || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      saveToConvex();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, viewport, hasUnsavedChanges, activeFlowId, autoSaveDelay, saveToConvex]);

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    if (isLoaded) {
      setHasUnsavedChanges(true);
    }
  }, [nodes, edges, viewport, isLoaded]);

  // Update save status based on state changes
  useEffect(() => {
    if (!isLoaded) {
      setSaveStatus('idle');
    } else if (isLoading) {
      setSaveStatus('saving');
    } else if (hasUnsavedChanges && !isLoading) {
      // Only show idle status if there are truly unsaved changes for a while
      const timeoutId = setTimeout(() => {
        setSaveStatus('idle');
      }, 1000); // Wait 1 second before showing "idle" status
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoaded, isLoading, hasUnsavedChanges]);

  // Manual save function
  const manualSave = useCallback(async () => {
    await saveToConvex();
  }, [saveToConvex]);

  // Update viewport function
  const updateViewportSync = useCallback(async (newViewport: Viewport) => {
    setViewport(newViewport);
    if (isLoaded) {
      setHasUnsavedChanges(true);
    }
  }, [isLoaded]);

  return {
    // Canvas state
    nodes,
    edges,
    viewport,
    setNodes,
    setEdges,
    setViewport: updateViewportSync,
    
    // Loading states
    isLoading,
    isLoaded,
    lastSaveTime,
    hasUnsavedChanges,
    saveStatus,
    
    // Actions
    manualSave,
    
    // Project info
    currentProject,
    activeFlowId,
  };
} 