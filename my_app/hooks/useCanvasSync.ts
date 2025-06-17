"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Node, Edge } from "reactflow";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { useProjectContext } from "../contexts/ProjectContext";

export interface CanvasSyncState {
  nodes: Node[];
  edges: Edge[];
  viewport: { x: number; y: number; zoom: number };
  isLoading: boolean;
  isLoaded: boolean;
  lastSaveTime: number | null;
}

export function useCanvasSync(autoSaveDelay: number = 2000) {
  const { currentProject, currentFlowId } = useProjectContext();
  
  // Local state for canvas data
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Convex queries and mutations
  const completeFlow = useQuery(
    api.flows.getCompleteFlow,
    currentProject ? { projectId: currentProject._id } : "skip"
  );
  
  const saveBatchFlowData = useMutation(api.flows.saveBatchFlowData);
  const updateViewport = useMutation(api.flows.updateFlowViewport);

  // Load data from Convex when flow is available
  useEffect(() => {
    if (completeFlow && !isLoaded) {
      console.log('🔄 Loading flow data from Convex:', completeFlow);
      
      // Convert Convex data to ReactFlow format
      const flowNodes: Node[] = completeFlow.nodes.map(node => ({
        id: node.nodeId,
        type: node.type,
        position: node.position,
        data: node.data,
        style: node.style,
        selected: node.selected || false,
        dragging: node.dragging || false,
      }));

      const flowEdges: Edge[] = completeFlow.edges.map(edge => ({
        id: edge.edgeId,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        animated: edge.animated || true,
        style: edge.style,
        label: edge.label,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setViewport(completeFlow.flow.viewport);
      setIsLoaded(true);
      
      console.log('✅ Flow data loaded:', { 
        nodes: flowNodes.length, 
        edges: flowEdges.length 
      });
    }
  }, [completeFlow, isLoaded]);

  // Reset loaded state when project changes
  useEffect(() => {
    setIsLoaded(false);
  }, [currentProject?._id]);

  // Auto-save functionality with debouncing
  const saveToConvex = useCallback(async () => {
    if (!currentFlowId || nodes.length === 0) {
      console.log('⚠️ Skipping save: no flow ID or empty nodes');
      return;
    }

    try {
      // Convert ReactFlow data to Convex format
      const convexNodes = nodes.map(node => ({
        nodeId: node.id,
        type: node.type || 'custom',
        position: node.position,
        data: {
          label: node.data?.label || '',
          type: node.data?.type || 'generic',
          color: node.data?.color,
        },
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
        flowId: currentFlowId,
        nodes: convexNodes,
        edges: convexEdges,
        viewport,
      });
      
      setLastSaveTime(Date.now());
      console.log('💾 Auto-saved to Convex:', { 
        nodes: convexNodes.length, 
        edges: convexEdges.length 
      });
      
    } catch (error) {
      console.error('❌ Auto-save failed:', error);
    }
  }, [currentFlowId, nodes, edges, viewport, saveBatchFlowData]);

  // Debounced auto-save
  useEffect(() => {
    if (!isLoaded || !currentFlowId) return;

    const timeoutId = setTimeout(() => {
      saveToConvex();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, viewport, isLoaded, currentFlowId, autoSaveDelay, saveToConvex]);

  // Manual save function
  const manualSave = useCallback(async () => {
    await saveToConvex();
  }, [saveToConvex]);

  // Update viewport function
  const updateCanvasViewport = useCallback(async (newViewport: { x: number; y: number; zoom: number }) => {
    setViewport(newViewport);
    
    if (currentFlowId) {
      try {
        await updateViewport({
          flowId: currentFlowId,
          viewport: newViewport,
        });
        console.log('🎯 Viewport updated:', newViewport);
      } catch (error) {
        console.error('❌ Viewport update failed:', error);
      }
    }
  }, [currentFlowId, updateViewport]);

  return {
    // Canvas state
    nodes,
    edges,
    viewport,
    setNodes,
    setEdges,
    setViewport: updateCanvasViewport,
    
    // Loading states
    isLoading: completeFlow === undefined && currentProject !== null,
    isLoaded,
    lastSaveTime,
    
    // Actions
    manualSave,
    
    // Flow info
    currentFlowId,
    hasUnsavedChanges: lastSaveTime === null || (Date.now() - lastSaveTime > autoSaveDelay + 1000),
  };
} 