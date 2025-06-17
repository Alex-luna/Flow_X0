"use client";

import React from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { Node, Edge } from "reactflow";

// Hook for project management
export function useProjects() {
  const projects = useQuery(api.projects.getAllProjects);
  const createProject = useMutation(api.projects.createProject);
  const updateProject = useMutation(api.projects.updateProject);
  const deleteProject = useMutation(api.projects.deleteProject);
  const getProject = useQuery(api.projects.getProject);
  const getRecentProjects = useQuery(api.projects.getRecentProjects);

  return {
    projects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    getRecentProjects,
    isLoading: projects === undefined,
  };
}

// Hook for project by ID
export function useProject(projectId: Id<"projects"> | undefined) {
  const project = useQuery(
    api.projects.getProject,
    projectId ? { projectId } : "skip"
  );
  
  const updateProject = useMutation(api.projects.updateProject);
  const getProjectStats = useQuery(
    api.projects.getProjectStats,
    projectId ? { projectId } : "skip"
  );

  return {
    project,
    updateProject,
    stats: getProjectStats,
    isLoading: project === undefined,
  };
}

// Hook for flow management
export function useFlow(projectId: Id<"projects"> | undefined) {
  const completeFlow = useQuery(
    api.flows.getCompleteFlow,
    projectId ? { projectId } : "skip"
  );
  
  const saveBatchFlowData = useMutation(api.flows.saveBatchFlowData);
  const saveNode = useMutation(api.flows.saveNode);
  const saveEdge = useMutation(api.flows.saveEdge);
  const deleteNode = useMutation(api.flows.deleteNode);
  const deleteEdge = useMutation(api.flows.deleteEdge);
  const updateViewport = useMutation(api.flows.updateFlowViewport);

  // Convert Convex data to ReactFlow format
  const reactFlowData = completeFlow ? {
    nodes: completeFlow.nodes.map(node => ({
      id: node.nodeId,
      type: node.type,
      position: node.position,
      data: node.data,
      style: node.style,
      selected: node.selected,
      dragging: node.dragging,
    })) as Node[],
    edges: completeFlow.edges.map(edge => ({
      id: edge.edgeId,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      animated: edge.animated,
      style: edge.style,
      label: edge.label,
    })) as Edge[],
    viewport: completeFlow.flow.viewport,
    flowId: completeFlow.flow._id,
  } : null;

  return {
    completeFlow,
    reactFlowData,
    saveBatchFlowData,
    saveNode,
    saveEdge,
    deleteNode,
    deleteEdge,
    updateViewport,
    isLoading: completeFlow === undefined,
  };
}

// Hook for auto-save functionality
export function useAutoSave(
  flowId: Id<"flows"> | undefined,
  nodes: Node[],
  edges: Edge[],
  viewport: { x: number; y: number; zoom: number },
  delay: number = 2000
) {
  const saveBatchFlowData = useMutation(api.flows.saveBatchFlowData);

  React.useEffect(() => {
    if (!flowId || nodes.length === 0) return;

    const timeoutId = setTimeout(() => {
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
        style: node.style,
        selected: node.selected,
        dragging: node.dragging,
      }));

      const convexEdges = edges.map(edge => ({
        edgeId: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
        animated: edge.animated,
        style: edge.style,
        label: edge.label,
      }));

      saveBatchFlowData({
        flowId,
        nodes: convexNodes,
        edges: convexEdges,
        viewport,
      }).catch(error => {
        console.error('❌ Auto-save failed:', error);
      });
      
      console.log('💾 Auto-saved flow data');
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [flowId, nodes, edges, viewport, delay, saveBatchFlowData]);

  return {
    saveBatchFlowData,
  };
}

// Types for better TypeScript support
export interface ProjectData {
  _id: Id<"projects">;
  _creationTime: number;
  name: string;
  description?: string;
  folder: string;
  status: "active" | "archived" | "draft";
  createdBy?: string;
  lastModified: number;
  settings?: {
    snapToGrid: boolean;
    showMiniMap: boolean;
    canvasBackground: string;
    theme: "light" | "dark";
  };
}

export interface FlowData {
  _id: Id<"flows">;
  _creationTime: number;
  projectId: Id<"projects">;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  createdBy?: string;
  lastModified: number;
}

export interface NodeData {
  _id: Id<"nodes">;
  nodeId: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    label: string;
    type: string;
    color?: string;
  };
  style?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
  };
  selected?: boolean;
  dragging?: boolean;
}

export interface EdgeData {
  _id: Id<"edges">;
  edgeId: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: {
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  label?: string;
} 