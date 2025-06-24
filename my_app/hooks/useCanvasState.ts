"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Node, Edge, Viewport } from "reactflow";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useProject } from "../contexts/ProjectContext";

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

export function useCanvasState(autoSaveDelay: number = 2000) {
  const { currentProject } = useProject();
  
  // Local state for canvas data
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [activeFlowId, setActiveFlowId] = useState<Id<"flows"> | null>(null);
  
  // Use refs to track if we're in the middle of loading to prevent state conflicts
  const isLoadingRef = useRef(false);
  const hasUnsavedChangesRef = useRef(false);

  // Convex queries and mutations
  const completeFlowData = useQuery(
    api.flows.getCompleteFlowSimple, 
    currentProject ? { projectId: currentProject.id as Id<"projects"> } : "skip"
  );
  
  const saveBatchFlowData = useMutation(api.flows.saveBatchFlowData);
  const createFlowMutation = useMutation(api.flows.createFlow);

  // Save to Convex
  const saveToConvex = useCallback(async () => {
    if (!activeFlowId || !currentProject) {
      console.log('⚠️ Skipping save: no flow or project');
      return;
    }

    try {
      console.log('💾 Saving to Convex...', { 
        flowId: activeFlowId,
        nodes: nodes.length, 
        edges: edges.length 
      });

      setSaveStatus('saving');
      hasUnsavedChangesRef.current = false;

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
      setSaveStatus('saved');
      
      console.log('✅ Saved to Convex successfully');
    } catch (error) {
      console.error('❌ Save to Convex failed:', error);
      setSaveStatus('error');
      hasUnsavedChangesRef.current = true;
    }
  }, [activeFlowId, currentProject, nodes, edges, viewport, saveBatchFlowData]);

  // Load flow data when project changes (separate from local state updates)
  useEffect(() => {
    if (!currentProject) {
      // Clear canvas when no project selected
      console.log('🧹 Clearing canvas - no project selected');
      isLoadingRef.current = true;
      setNodes([]);
      setEdges([]);
      setViewport({ x: 0, y: 0, zoom: 1 });
      setActiveFlowId(null);
      setIsLoaded(false);
      isLoadingRef.current = false;
      hasUnsavedChangesRef.current = false;
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
        isLoadingRef.current = true;
        setActiveFlowId(flowId);
        setNodes([]);
        setEdges([]);
        setViewport({ x: 0, y: 0, zoom: 1 });
        setIsLoaded(true);
        setLastSaveTime(new Date());
        setSaveStatus('saved');
        isLoadingRef.current = false;
        hasUnsavedChangesRef.current = false;
      }).catch((error) => {
        console.error('❌ Failed to create flow:', error);
      });
    } else {
      // Load existing flow data
      console.log('📂 Loading flow data for project:', currentProject.name);
      
      isLoadingRef.current = true;
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
      setSaveStatus('saved');
      isLoadingRef.current = false;
      hasUnsavedChangesRef.current = false;
      
      console.log('✅ Loaded flow data:', {
        nodes: reactFlowNodes.length,
        edges: reactFlowEdges.length,
        viewport: completeFlowData.viewport
      });
    }
  }, [currentProject, completeFlowData, createFlowMutation]);

  // Auto-save with debouncing (only trigger when not loading)
  useEffect(() => {
    if (!activeFlowId || !hasUnsavedChangesRef.current || isLoadingRef.current) return;

    const timeoutId = setTimeout(() => {
      saveToConvex();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, viewport, activeFlowId, autoSaveDelay, saveToConvex]);

  // Track unsaved changes (only when not loading)
  useEffect(() => {
    if (isLoaded && !isLoadingRef.current) {
      hasUnsavedChangesRef.current = true;
      console.log('📝 Marking changes as unsaved');
    }
  }, [nodes, edges, viewport, isLoaded]);

  // Enhanced setNodes with immediate save for new nodes
  const setNodesWithImmediateSave = useCallback((nodesOrUpdater: Node[] | ((prevNodes: Node[]) => Node[])) => {
    if (isLoadingRef.current) {
      console.log('⚠️ Ignoring node update during loading');
      return;
    }

    if (typeof nodesOrUpdater === 'function') {
      setNodes((prevNodes) => {
        const newNodes = nodesOrUpdater(prevNodes);
        
        // Check if new nodes were added
        if (newNodes.length > prevNodes.length) {
          console.log('🚀 New node detected, scheduling immediate save');
          hasUnsavedChangesRef.current = true;
          // Trigger immediate save
          setTimeout(() => saveToConvex(), 100);
        }
        
        return newNodes;
      });
    } else {
      setNodes(nodesOrUpdater);
      
      // Check if this is likely a new node addition
      if (nodes.length < nodesOrUpdater.length) {
        console.log('🚀 New node detected, scheduling immediate save');
        hasUnsavedChangesRef.current = true;
        setTimeout(() => saveToConvex(), 100);
      }
    }
  }, [nodes.length, saveToConvex]);

  // Manual save function
  const manualSave = useCallback(async () => {
    await saveToConvex();
  }, [saveToConvex]);

  return {
    // Canvas state
    nodes,
    edges,
    viewport,
    setNodes: setNodesWithImmediateSave,
    setEdges,
    setViewport,
    
    // Loading states
    isLoading,
    isLoaded,
    lastSaveTime,
    hasUnsavedChanges: hasUnsavedChangesRef.current,
    saveStatus,
    
    // Actions
    manualSave,
    
    // Project info
    currentProject,
    activeFlowId,
  };
} 