"use client";

import React, { useCallback, useRef, useState, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  OnConnect,
  OnConnectStart,
  OnConnectEnd,
  OnNodesChange,
  OnEdgesChange,
  ReactFlowInstance,
  applyNodeChanges,
  applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './Node';
import { useTheme } from '../contexts/ThemeContext';
import { useCanvasSync } from '../hooks/useCanvasSync';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { getSmartNodePosition, getViewportCenter, ViewportInfo } from '../lib/utils/canvasHelpers';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';

// Define nodeTypes outside component to prevent re-creation
const nodeTypes = {
  custom: CustomNode,
};

// Hook personalizado para debounce
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Tipo para representar bounds de um node
interface NodeBounds {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

// Edge styles will be dynamically generated based on theme

  // Edge options will be created dynamically inside component

interface CanvasProps {
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
}

const Canvas: React.FC<CanvasProps> = ({ onAddNode }) => {
  const { theme, isDark } = useTheme();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Use Convex sync hook for canvas data
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    isLoading,
    isLoaded,
    lastSaveTime,
    manualSave,
    saveStatus,
    activeFlowId,
  } = useCanvasSync();
  
  // Add mutation hook for individual node updates
  const saveNodeMutation = useMutation(api.flows.saveNode);
  
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [currentViewport, setCurrentViewport] = useState<ViewportInfo>({ x: 0, y: 0, zoom: 1 });
  
  // States for keyboard shortcuts functionality
  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  
  // Create ReactFlow-compatible change handlers using applyNodeChanges and applyEdgeChanges
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds: Node[]) => applyNodeChanges(changes, nds));
  }, [setNodes]);
  
  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds: Edge[]) => applyEdgeChanges(changes, eds));
  }, [setEdges]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    edgeId: string | null;
  }>({ show: false, x: 0, y: 0, edgeId: null });
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Estado para auto-conexão de nodes
  const [connectionInProgress, setConnectionInProgress] = useState<{
    isConnecting: boolean;
    sourceNode: string | null;
    sourceHandle: string | null;
    hoveredNode: string | null;
    mousePosition: { x: number; y: number } | null;
  }>({
    isConnecting: false,
    sourceNode: null,
    sourceHandle: null,
    hoveredNode: null,
    mousePosition: null,
  });

  // Helper function to generate unique node ID
  const generateNodeId = useCallback(() => {
    return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);



  // Keyboard shortcuts functions
  const copySelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length > 0) {
      setCopiedNodes(selectedNodes);
      console.log(`📋 Copied ${selectedNodes.length} node(s)`);
    }
  }, [nodes]);

  const pasteNodes = useCallback(() => {
    if (copiedNodes.length === 0) return;

    // Get viewport center as base position for pasting
    const viewportCenter = getViewportCenter(currentViewport);
    const baseOffset = 30; // Base offset for pasting

    const newNodes = copiedNodes.map((node, index) => ({
      ...node,
      id: generateNodeId(),
      position: {
        x: viewportCenter.x + (index * baseOffset),
        y: viewportCenter.y + (index * baseOffset),
      },
      selected: true, // Select the newly pasted nodes
    }));

    setNodes(currentNodes => [...currentNodes.map(n => ({ ...n, selected: false })), ...newNodes]);
    console.log(`📋 Pasted ${newNodes.length} node(s)`);
  }, [copiedNodes, generateNodeId, setNodes, currentViewport]);

  const duplicateSelectedNodes = useCallback(() => {
    const selectedNodes = nodes.filter(node => node.selected);
    if (selectedNodes.length === 0) return;

    const baseOffset = 30; // Offset for duplicated nodes

    const duplicatedNodes = selectedNodes.map((node, index) => ({
      ...node,
      id: generateNodeId(),
      position: {
        x: node.position.x + baseOffset,
        y: node.position.y + baseOffset,
      },
      selected: true, // Select the duplicated nodes
    }));

    setNodes(currentNodes => [...currentNodes.map(n => ({ ...n, selected: false })), ...duplicatedNodes]);
    console.log(`🔄 Duplicated ${duplicatedNodes.length} node(s)`);
  }, [nodes, generateNodeId, setNodes]);

  const selectAllNodes = useCallback(() => {
    setNodes(currentNodes => currentNodes.map(node => ({ ...node, selected: true })));
    console.log(`✅ Selected all ${nodes.length} node(s)`);
  }, [nodes.length, setNodes]);

  // Dynamic edge styles based on theme
  const animatedEdgeStyle = React.useMemo(() => ({
    stroke: theme.colors.canvas.edge,
    strokeWidth: 2,
    strokeDasharray: '6 4',
  }), [theme.colors.canvas.edge]);

  const selectedEdgeStyle = React.useMemo(() => ({
    stroke: theme.colors.canvas.edgeSelected,
    strokeWidth: 3,
    strokeDasharray: '6 4',
  }), [theme.colors.canvas.edgeSelected]);

  const edgeOptions = React.useMemo(() => ({
    animated: true,
    style: animatedEdgeStyle,
    focusable: true,
    deletable: true,
  }), [animatedEdgeStyle]);

  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) return;
      
      // Add animated edge
      setEdges((eds: Edge[]) => {
        const exists = eds.some(e => e.source === params.source && e.target === params.target);
        if (exists) return eds;
        return addEdge({ ...params, ...edgeOptions }, eds);
      });
    },
    [setEdges, edgeOptions]
  );

  // Handler para quando inicia uma conexão
  const onConnectStart: OnConnectStart = useCallback(
    (event, { nodeId, handleId, handleType }) => {
      setConnectionInProgress({
        isConnecting: true,
        sourceNode: nodeId,
        sourceHandle: handleId,
        hoveredNode: null,
        mousePosition: null,
      });
    },
    []
  );

    // Função para calcular o melhor handle de destino baseado na posição relativa
  const calculateBestTargetHandle = useCallback(
    (sourceNodeId: string, targetNodeId: string, sourceHandle: string) => {
      const sourceNode = nodes.find(n => n.id === sourceNodeId);
      const targetNode = nodes.find(n => n.id === targetNodeId);
      
      if (!sourceNode || !targetNode) {
        // Fallback para lógica simples se nodes não encontrados
        return sourceHandle === 'source-right' ? 'target-left' : 'source-right';
      }
      
      // Calcular posições centrais dos nodes
      const sourceCenterX = sourceNode.position.x + 52.5; // 105/2
      const targetCenterX = targetNode.position.x + 52.5;
      
      // Se source node está à esquerda do target, conectar da direita para esquerda
      if (sourceCenterX < targetCenterX) {
        return sourceHandle === 'source-right' ? 'target-left' : 'source-right'; 
      } else {
        // Se source node está à direita do target, conectar da esquerda para direita
        return sourceHandle === 'target-left' ? 'source-right' : 'target-left';
      }
    },
    [nodes]
  );

  // Handler para quando termina uma conexão
  const onConnectEnd: OnConnectEnd = useCallback(
    (event) => {
      const { isConnecting, sourceNode, sourceHandle, hoveredNode } = connectionInProgress;
      
      if (isConnecting && sourceNode && hoveredNode && sourceNode !== hoveredNode) {
        // Verificar se já existe uma conexão entre estes nodes
        const existingConnection = edges.find(edge => 
          (edge.source === sourceNode && edge.target === hoveredNode) ||
          (edge.source === hoveredNode && edge.target === sourceNode)
        );
        
        if (!existingConnection) {
          // Auto-conectar ao node que está sendo hovered
          // Calcular o melhor handle de destino baseado na posição relativa
          const targetHandle = calculateBestTargetHandle(sourceNode, hoveredNode, sourceHandle || 'source-right');
          
          const connection: Connection = {
            source: sourceNode,
            sourceHandle: sourceHandle,
            target: hoveredNode, 
            targetHandle: targetHandle,
          };
          
          // Usar o onConnect existente para criar a conexão
          onConnect(connection);
        }
      }
      
      // Reset connection state e debounce
      setConnectionInProgress({
        isConnecting: false,
        sourceNode: null,
        sourceHandle: null,
        hoveredNode: null,
        mousePosition: null,
      });
      setMousePosition(null); // Reset debounce state
    },
    [connectionInProgress, onConnect, edges, calculateBestTargetHandle]
  );

  // Função para calcular bounds precisos de cada node
  const getNodeDimensions = useCallback((nodeType: string) => {
    // Diferentes tipos de nodes têm dimensões diferentes
    switch (nodeType) {
      case 'generic':
      case 'url':
      case 'signup':
      case 'checkout':
      case 'calendar':
      case 'survey':
      case 'thankyou':
      case 'user':
      case 'post':
      case 'download':
      case 'popup':
      case 'comments':
      case 'cta1':
      case 'cta2':
      case 'cta3':
        // Funnel steps têm dimensões específicas
        return { width: 105, height: 175 };
      default:
        // Traditional nodes
        return { width: 80, height: 32 };
    }
  }, []);

  // Cache optimizado dos bounds dos nodes usando useMemo
  const nodesBoundsCache = useMemo(() => {
    const bounds: NodeBounds[] = [];
    
    for (const node of nodes) {
      const dimensions = getNodeDimensions(node.data.type || 'default');
      const nodeBounds: NodeBounds = {
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        width: dimensions.width,
        height: dimensions.height,
        right: node.position.x + dimensions.width,
        bottom: node.position.y + dimensions.height,
      };
      bounds.push(nodeBounds);
    }
    
    // Ordenar bounds por posição X para otimizar busca
    bounds.sort((a, b) => a.x - b.x);
    
    return bounds;
  }, [nodes, getNodeDimensions]);

  // Sistema de spatial grid simples para otimização com muitos nodes
  const spatialGrid = useMemo(() => {
    if (nodes.length < 20) {
      // Para poucos nodes, não vale a pena usar grid
      return null;
    }

    const GRID_SIZE = 200; // Tamanho da célula do grid
    const grid = new Map<string, NodeBounds[]>();
    
    for (const bounds of nodesBoundsCache) {
      // Calcular quais células do grid o node ocupa
      const startX = Math.floor(bounds.x / GRID_SIZE);
      const endX = Math.floor(bounds.right / GRID_SIZE);
      const startY = Math.floor(bounds.y / GRID_SIZE);
      const endY = Math.floor(bounds.bottom / GRID_SIZE);
      
      for (let gridX = startX; gridX <= endX; gridX++) {
        for (let gridY = startY; gridY <= endY; gridY++) {
          const key = `${gridX},${gridY}`;
          if (!grid.has(key)) {
            grid.set(key, []);
          }
          grid.get(key)!.push(bounds);
        }
      }
    }
    
    return { grid, gridSize: GRID_SIZE };
  }, [nodesBoundsCache, nodes.length]);

  // Função otimizada para detectar se o mouse está sobre um node
  const getNodeAtPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!reactFlowWrapper.current || !reactFlowInstance) return null;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const canvasPosition = reactFlowInstance.project({
        x: clientX - reactFlowBounds.left,
        y: clientY - reactFlowBounds.top,
      });
      
      // Usar spatial grid para muitos nodes (melhora performance)
      if (spatialGrid) {
        const gridX = Math.floor(canvasPosition.x / spatialGrid.gridSize);
        const gridY = Math.floor(canvasPosition.y / spatialGrid.gridSize);
        const key = `${gridX},${gridY}`;
        const cellNodes = spatialGrid.grid.get(key) || [];
        
        // Verificar apenas nodes na célula atual
        for (const bounds of cellNodes) {
          if (
            canvasPosition.x >= bounds.x &&
            canvasPosition.x <= bounds.right &&
            canvasPosition.y >= bounds.y &&
            canvasPosition.y <= bounds.bottom
          ) {
            return bounds.id;
          }
        }
      } else {
        // Para poucos nodes, usar busca linear otimizada
        for (const bounds of nodesBoundsCache) {
          // Early exit optimization: se X está fora do range, pule
          if (canvasPosition.x < bounds.x) break; // Lista está ordenada por X
          if (canvasPosition.x > bounds.right) continue;
          
          if (
            canvasPosition.y >= bounds.y &&
            canvasPosition.y <= bounds.bottom
          ) {
            return bounds.id;
          }
        }
      }
      
      return null;
    },
    [reactFlowWrapper, reactFlowInstance, nodesBoundsCache, spatialGrid]
  );

  // Estado para debounce da posição do mouse
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const debouncedMousePosition = useDebounce(mousePosition, 10); // 10ms debounce

  // Handler otimizado para detectar hover sobre nodes durante conexão
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!connectionInProgress.isConnecting) return;
      
      // Atualizar posição do mouse para debounce
      setMousePosition({ x: event.clientX, y: event.clientY });
    },
    [connectionInProgress.isConnecting]
  );

  // Effect para processar mudanças de posição com debounce
  React.useEffect(() => {
    if (!connectionInProgress.isConnecting || !debouncedMousePosition) return;
    
    const hoveredNodeId = getNodeAtPosition(debouncedMousePosition.x, debouncedMousePosition.y);
    
    if (hoveredNodeId !== connectionInProgress.hoveredNode) {
      setConnectionInProgress(prev => ({
        ...prev,
        hoveredNode: hoveredNodeId,
        mousePosition: debouncedMousePosition,
      }));
    }
  }, [debouncedMousePosition, connectionInProgress.isConnecting, connectionInProgress.hoveredNode, getNodeAtPosition, nodes.length, spatialGrid]);

  // Função para atualizar nodes com highlight de conexão
  const highlightedNodes = React.useMemo(() => {
    if (!connectionInProgress.isConnecting || !connectionInProgress.hoveredNode) {
      return nodes;
    }
    
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isConnectionTarget: node.id === connectionInProgress.hoveredNode && node.id !== connectionInProgress.sourceNode
      }
    }));
  }, [nodes, connectionInProgress.isConnecting, connectionInProgress.hoveredNode, connectionInProgress.sourceNode]);

  // Handle edge click - select edge for deletion
  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      console.log('🎯 Selecting edge:', edge.id);
      setSelectedEdges([edge.id]);
    },
    [setSelectedEdges]
  );

  // Helper function to check if we're in an editable element
  const isInEditableElement = useCallback(() => {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    
    // Check for editable elements
    if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
      return true;
    }
    
    // Check for contenteditable elements
    if (activeElement.hasAttribute('contenteditable')) {
      return true;
    }
    
    // Check if element is inside a modal by looking for modal class/attribute
    const isInModal = activeElement.closest('[role="dialog"]') || 
                     activeElement.closest('.modal') ||
                     activeElement.closest('[data-modal]');
    
    return !!isInModal;
  }, []);

  // Handle keyboard shortcuts and deletion for selected edges
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Skip custom shortcuts if we're in an editable element or modal
      if (isInEditableElement()) {
        return; // Let the browser handle the event naturally
      }

      // Prevent default behavior for our custom shortcuts
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      
      // Handle keyboard shortcuts
      if (isCtrlOrCmd) {
        switch (event.key.toLowerCase()) {
          case 'c':
            event.preventDefault();
            copySelectedNodes();
            break;
          case 'v':
            event.preventDefault();
            pasteNodes();
            break;
          case 'd':
            event.preventDefault();
            duplicateSelectedNodes();
            break;
          case 'a':
            event.preventDefault();
            selectAllNodes();
            break;
        }
        return;
      }

      // Handle deletion for selected edges (existing functionality)
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdges.length > 0) {
        setEdges((eds: Edge[]) => eds.filter(e => !selectedEdges.includes(e.id)));
        setSelectedEdges([]);
      }
    },
    [selectedEdges, setEdges, setSelectedEdges, copySelectedNodes, pasteNodes, duplicateSelectedNodes, selectAllNodes, isInEditableElement]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.error('❌ ReactFlow wrapper or instance not available');
        return;
      }

      try {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        
        // Try both data formats for compatibility
        let dragDataString = event.dataTransfer.getData('application/json');
        if (!dragDataString) {
          dragDataString = event.dataTransfer.getData('text/plain');
        }
        
        if (!dragDataString) {
          console.error('❌ No drag data found');
          return;
        }

        const dragData = JSON.parse(dragDataString);

        const dropPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        // Use smart positioning to avoid overlaps
        const smartPosition = getSmartNodePosition(
          dragData.type,
          nodes,
          currentViewport,
          dropPosition,
          snapToGrid
        );

        // Create new node with proper data structure
        const newNode: Node = {
          id: `${dragData.type}-${Date.now()}`,
          type: 'custom',
          position: smartPosition,
          data: {
            label: dragData.label || dragData.type,
            type: dragData.type,
            color: '#6366F1',
          },
        };

        setNodes((nds: Node[]) => nds.concat(newNode));
      } catch (error) {
        console.error('❌ Error handling drop:', error);
      }
    },
    [reactFlowInstance, setNodes]
  );

  // Wrapper-specific handlers
  const onWrapperDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onWrapperDrop = useCallback((event: React.DragEvent) => {
    onDrop(event);
  }, [onDrop]);

  // Handle programmatic node addition (from click)
  const handleAddNode = useCallback((type: string, position?: { x: number; y: number }) => {
    // Use smart positioning instead of fixed position
    const preferredPosition = position || getViewportCenter(currentViewport);
    
    // Get current nodes for collision detection
    setNodes((currentNodes: Node[]) => {
      const smartPosition = getSmartNodePosition(
        type,
        currentNodes,
        currentViewport,
        preferredPosition,
        snapToGrid
      );
      
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'custom',
        position: smartPosition,
        data: {
          label: type.charAt(0).toUpperCase() + type.slice(1),
          type: type,
          color: '#6366F1',
        },
      };

      return currentNodes.concat(newNode);
    });
  }, [setNodes, currentViewport, snapToGrid]);

  // Pass the handler to parent
  React.useEffect(() => {
    if (onAddNode && typeof onAddNode === 'object') {
              // Replace the parent's onAddNode with our handler
        const onAddNodeRef = onAddNode as any;
        onAddNodeRef.current = handleAddNode;
        // Also pass ReactFlow instance and wrapper for manual drop calculation
        onAddNodeRef.getDropPosition = (clientX: number, clientY: number) => {
        if (!reactFlowWrapper.current || !reactFlowInstance) {
          return { x: clientX - 220, y: clientY - 100 };
        }
        
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: clientX - reactFlowBounds.left,
          y: clientY - reactFlowBounds.top,
        });
        
        return position;
      };
    }
  }, [handleAddNode, onAddNode, reactFlowInstance]);

  // Event listener para mouse move durante conexão
  React.useEffect(() => {
    if (connectionInProgress.isConnecting) {
      document.addEventListener('mousemove', handleMouseMove);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [connectionInProgress.isConnecting, handleMouseMove]);

  // Global drop listener
  React.useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault(); // Allow drop
    };
    
    document.addEventListener('dragover', handleGlobalDragOver);
    
    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, []);

  // Add keyboard listener
  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  // Clear edge selection when clicking on canvas
  const onPaneClick = useCallback(() => {
    if (selectedEdges.length > 0) {
      console.log('🎯 Clearing edge selection');
      setSelectedEdges([]);
    }
    // Also close context menu
    setContextMenu({ show: false, x: 0, y: 0, edgeId: null });
  }, [selectedEdges, setSelectedEdges]);

  // Handle edge right-click for context menu
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      event.stopPropagation();
      console.log('🎯 Right-click on edge:', edge.id);
      
      setContextMenu({
        show: true,
        x: event.clientX,
        y: event.clientY,
        edgeId: edge.id
      });
    },
    [setContextMenu]
  );

  // Handle context menu delete action
  const handleContextMenuDelete = useCallback(() => {
    if (contextMenu.edgeId) {
      setEdges((eds: Edge[]) => eds.filter(e => e.id !== contextMenu.edgeId));
      setContextMenu({ show: false, x: 0, y: 0, edgeId: null });
    }
  }, [contextMenu.edgeId, setEdges, setContextMenu]);

  // Update edges with dynamic styling based on selection
  const styledEdges = React.useMemo(() => {
    return edges.map(edge => ({
      ...edge,
      style: selectedEdges.includes(edge.id) ? selectedEdgeStyle : animatedEdgeStyle,
      animated: true,
      className: selectedEdges.includes(edge.id) ? 'selected-edge' : '',
    }));
  }, [edges, selectedEdges]);

  // TODO: Add viewport sync when ReactFlow 12 is available with onViewportChange

  // Handle window resize for MiniMap responsiveness
  React.useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setShowMiniMap(!isMobile);
    };
    
    handleResize(); // Check initial size
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Stable function to handle node data updates (only labels)
  const handleNodeLabelUpdate = useCallback(async (nodeId: string, newLabel: string) => {
    if (!activeFlowId) return;
    
    try {
      // Find the node to update in current nodes
      const nodeToUpdate = nodes.find(n => n.id === nodeId);
      if (!nodeToUpdate) return;

      // Update local state immediately for responsive UI
      setNodes((prevNodes: Node[]) => 
        prevNodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );

      // Save to server
      const updateData = {
        flowId: activeFlowId,
        nodeId: nodeId,
        type: nodeToUpdate.type || 'custom',
        position: nodeToUpdate.position,
        data: { ...nodeToUpdate.data, label: newLabel }
      };
      
      await saveNodeMutation(updateData);
    } catch (error) {
      console.error('Failed to save node label:', error);
      
      // Revert local state on error
      setNodes((prevNodes: Node[]) => 
        prevNodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: { ...node.data, label: node.data.label } } // Keep original
            : node
        )
      );
    }
  }, [activeFlowId, saveNodeMutation, setNodes]); // Simplified dependencies

  // Handle full node data updates (for URL, Image, and other properties)
  const handleNodeUpdate = useCallback(async (nodeId: string, newData: any) => {
    if (!activeFlowId) return;
    
    try {
      // Find the node to update in current nodes
      const nodeToUpdate = nodes.find(n => n.id === nodeId);
      if (!nodeToUpdate) return;

      // Update local state immediately for responsive UI
      setNodes((prevNodes: Node[]) => 
        prevNodes.map(node => 
          node.id === nodeId 
            ? { ...node, data: newData }
            : node
        )
      );

      // Save to server
      const updateData = {
        flowId: activeFlowId,
        nodeId: nodeId,
        type: nodeToUpdate.type || 'custom',
        position: nodeToUpdate.position,
        data: newData
      };
      
      await saveNodeMutation(updateData);
      console.log('✅ Node updated successfully:', nodeId, newData);
    } catch (error) {
      console.error('❌ Failed to save node data:', error);
      
      // Revert local state on error - keep original data
      const originalNode = nodes.find(n => n.id === nodeId);
      if (originalNode) {
        setNodes((prevNodes: Node[]) => 
          prevNodes.map(node => 
            node.id === nodeId 
              ? { ...node, data: originalNode.data } // Revert to original
              : node
          )
        );
      }
    }
  }, [activeFlowId, saveNodeMutation, setNodes, nodes]);

  // Use a ref to store the handlers without causing re-renders
  const handlerRef = useRef(handleNodeLabelUpdate);
  const nodeUpdateRef = useRef(handleNodeUpdate);
  handlerRef.current = handleNodeLabelUpdate;
  nodeUpdateRef.current = handleNodeUpdate;

  // Create stable nodeTypes that never change
  const stableNodeTypes = useMemo(() => ({
    custom: (props: any) => (
      <CustomNode 
        {...props} 
        onLabelUpdate={(id: string, label: string) => handlerRef.current(id, label)}
        onNodeUpdate={(id: string, newData: any) => nodeUpdateRef.current(id, newData)}
      />
    )
  }), []); // Empty dependencies - never recreated

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls Bar */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          backgroundColor: theme.colors.background.elevated,
          borderColor: theme.colors.border.primary
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleAddNode('generic')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: theme.colors.accent.primary,
              color: theme.colors.text.inverse
            }}
          >
            Add Node
          </button>
          
          <button
            onClick={() => handleAddNode('test')}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
            style={{
              backgroundColor: theme.colors.accent.success,
              color: theme.colors.text.inverse
            }}
          >
            Test
          </button>
          
          <label 
            className="flex items-center gap-2 cursor-pointer select-none text-sm"
            style={{ color: theme.colors.text.primary }}
          >
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={e => setSnapToGrid(e.target.checked)}
              style={{ accentColor: theme.colors.accent.primary }}
            />
            Snap to Grid
          </label>

          <label 
            className="flex items-center gap-2 cursor-pointer select-none text-sm"
            style={{ color: theme.colors.text.primary }}
          >
            <input
              type="checkbox"
              checked={showMiniMap}
              onChange={e => setShowMiniMap(e.target.checked)}
              style={{ accentColor: theme.colors.accent.primary }}
            />
            Show Mini Map
          </label>
        </div>
        
        <div className="flex items-center gap-4">
          <div 
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            🎯 Drag from sidebar | Space+Drag to pan | Ctrl+C/V/D/A for copy/paste/duplicate/select all
          </div>
          
          {/* Save Status Indicator */}
          <SaveStatusIndicator 
            status={saveStatus}
            lastSaveTime={lastSaveTime}
            className="mr-2"
          />
          
          {/* Manual Save Button (only show when needed) */}
          {!isLoading && !isLoaded && (
            <button
              onClick={manualSave}
              className="px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 hover:brightness-110"
              style={{
                backgroundColor: theme.colors.accent.warning,
                color: theme.colors.text.inverse
              }}
            >
              Manual Save
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div 
        className="flex-1" 
        ref={reactFlowWrapper}
        onDrop={onWrapperDrop}
        onDragOver={onWrapperDragOver}
      >
        <ReactFlow
          key="horizontal-handles-fix-v3"
          nodes={highlightedNodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          onEdgeClick={onEdgeClick}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
          onMove={(event, viewport) => setCurrentViewport(viewport)}

          nodeTypes={stableNodeTypes}
          fitView
          snapToGrid={snapToGrid}
          snapGrid={[16, 16]}
          attributionPosition="top-right"
          panOnScroll
          panOnDrag={[1, 2]}
          panActivationKeyCode="Space"
          selectionOnDrag
          minZoom={0.5}
          maxZoom={2}
          nodeExtent={[[-1000, -1000], [2000, 2000]]}
          connectionLineStyle={{ 
            stroke: theme.colors.canvas.edge, 
            strokeWidth: 2, 
            strokeDasharray: '6 4' 
          }}
          deleteKeyCode={['Delete', 'Backspace']}
          onlyRenderVisibleElements={false}
          preventScrolling={false}
          style={{ backgroundColor: theme.colors.canvas.background }}
        >
          <Controls />
          {showMiniMap && (
            <MiniMap 
              nodeColor={(node) => {
                if (node.data.type && node.data.type !== 'generic') {
                  return theme.colors.accent.primary; // Brand red for funnel steps
                }
                return node.data.color || theme.colors.accent.primary;
              }}
              nodeStrokeColor={theme.colors.text.primary}
              nodeStrokeWidth={2}
              nodeBorderRadius={8}
              maskColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
              style={{
                backgroundColor: theme.colors.background.elevated,
                border: `1px solid ${theme.colors.border.primary}`,
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
              }}
              position="bottom-right"
              pannable
              zoomable
              ariaLabel="Canvas mini map for navigation"
            />
          )}
          <Background 
            gap={16} 
            color={theme.colors.canvas.grid}
            style={{ backgroundColor: theme.colors.canvas.background }}
          />
        </ReactFlow>
        
        {/* Context Menu */}
        {contextMenu.show && (
          <div
            className="fixed rounded-lg shadow-lg z-[10000] py-1"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              backgroundColor: theme.colors.background.elevated,
              border: `1px solid ${theme.colors.border.primary}`,
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
            }}
          >
            <button
              onClick={handleContextMenuDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm transition-colors rounded-lg"
              style={{
                color: theme.colors.accent.danger,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.secondary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <span style={{ color: theme.colors.accent.danger }}>🗑️</span>
              Delete Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CanvasWithProvider: React.FC<CanvasProps> = (props) => (
  <ReactFlowProvider>
    <Canvas {...props} />
  </ReactFlowProvider>
);

export default CanvasWithProvider; 