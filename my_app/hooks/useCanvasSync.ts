"use client";

import { useState, useEffect, useCallback } from "react";
import { Node, Edge, Viewport } from "reactflow";
import { useProject } from "../contexts/ProjectContext";

export interface CanvasSyncState {
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  isLoading: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export function useCanvasSync(autoSaveDelay: number = 2000) {
  const { currentProject } = useProject();
  
  // Local state for canvas data
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock save function for now
  const saveToStorage = useCallback(async () => {
    if (!currentProject || nodes.length === 0) {
      console.log('⚠️ Skipping save: no project or empty nodes');
      return;
    }

    try {
      console.log('💾 Saving to localStorage...', { 
        projectId: currentProject.id,
        nodes: nodes.length, 
        edges: edges.length 
      });

      const flowData = {
        projectId: currentProject.id,
        nodes,
        edges,
        viewport,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(`flow-${currentProject.id}`, JSON.stringify(flowData));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      
      console.log('✅ Saved to localStorage');
    } catch (error) {
      console.error('❌ Save failed:', error);
    }
  }, [currentProject, nodes, edges, viewport]);

  // Load data from localStorage when project changes
  useEffect(() => {
    if (!currentProject) return;

    try {
      const savedData = localStorage.getItem(`flow-${currentProject.id}`);
      if (savedData) {
        const flowData = JSON.parse(savedData);
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        setViewport(flowData.viewport || { x: 0, y: 0, zoom: 1 });
        setLastSaved(flowData.lastSaved ? new Date(flowData.lastSaved) : null);
        console.log('✅ Loaded flow data from localStorage');
      } else {
        // Reset to empty state for new project
        setNodes([]);
        setEdges([]);
        setViewport({ x: 0, y: 0, zoom: 1 });
        setLastSaved(null);
      }
    } catch (error) {
      console.error('❌ Failed to load flow data:', error);
    }
  }, [currentProject?.id]);

  // Auto-save with debouncing
  useEffect(() => {
    if (!currentProject || !hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [nodes, edges, viewport, hasUnsavedChanges, currentProject, autoSaveDelay, saveToStorage]);

  // Mark as having unsaved changes when data changes
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [nodes, edges, viewport]);

  // Manual save function
  const manualSave = useCallback(async () => {
    await saveToStorage();
  }, [saveToStorage]);

  // Update viewport function
  const updateViewportSync = useCallback(async (newViewport: Viewport) => {
    setViewport(newViewport);
    setHasUnsavedChanges(true);
  }, []);

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
    lastSaved,
    hasUnsavedChanges,
    
    // Actions
    manualSave,
    
    // Project info
    currentProject,
  };
} 