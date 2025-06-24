"use client";

import React, { useCallback, useRef, useState } from 'react';
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

const nodeTypes = {
  custom: CustomNode,
};

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
  } = useCanvasSync();
  
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [currentViewport, setCurrentViewport] = useState<ViewportInfo>({ x: 0, y: 0, zoom: 1 });
  
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
      console.log('🔌 Connection started:', { nodeId, handleId, handleType });
      
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
      console.log('🔌 Connection ended');
      const { isConnecting, sourceNode, sourceHandle, hoveredNode } = connectionInProgress;
      
      if (isConnecting && sourceNode && hoveredNode && sourceNode !== hoveredNode) {
        // Verificar se já existe uma conexão entre estes nodes
        const existingConnection = edges.find(edge => 
          (edge.source === sourceNode && edge.target === hoveredNode) ||
          (edge.source === hoveredNode && edge.target === sourceNode)
        );
        
        if (existingConnection) {
          console.log('⚠️ Connection already exists between nodes');
        } else {
          // Auto-conectar ao node que está sendo hovered
          console.log('🎯 Auto-connecting:', { sourceNode, sourceHandle, hoveredNode });
          
          // Calcular o melhor handle de destino baseado na posição relativa
          const targetHandle = calculateBestTargetHandle(sourceNode, hoveredNode, sourceHandle || 'source-right');
          
          const connection: Connection = {
            source: sourceNode,
            sourceHandle: sourceHandle,
            target: hoveredNode, 
            targetHandle: targetHandle,
          };
          
          console.log('🔗 Creating connection:', connection);
          
          // Usar o onConnect existente para criar a conexão
          onConnect(connection);
        }
      }
      
      // Reset connection state
      setConnectionInProgress({
        isConnecting: false,
        sourceNode: null,
        sourceHandle: null,
        hoveredNode: null,
        mousePosition: null,
      });
    },
    [connectionInProgress, onConnect, edges, calculateBestTargetHandle]
  );

  // Função para detectar se o mouse está sobre um node
  const getNodeAtPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!reactFlowWrapper.current || !reactFlowInstance) return null;
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const canvasPosition = reactFlowInstance.project({
        x: clientX - reactFlowBounds.left,
        y: clientY - reactFlowBounds.top,
      });
      
      // Verificar cada node para ver se o mouse está dentro de suas bounds
      for (const node of nodes) {
        const nodeX = node.position.x;
        const nodeY = node.position.y;
        // Assumindo dimensões padrão do node (105x175 baseado no Node.tsx)
        const nodeWidth = 105;
        const nodeHeight = 175;
        
        if (
          canvasPosition.x >= nodeX &&
          canvasPosition.x <= nodeX + nodeWidth &&
          canvasPosition.y >= nodeY &&
          canvasPosition.y <= nodeY + nodeHeight
        ) {
          return node.id;
        }
      }
      
      return null;
    },
    [reactFlowWrapper, reactFlowInstance, nodes]
  );

  // Handler para detectar hover sobre nodes durante conexão
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!connectionInProgress.isConnecting) return;
      
      const hoveredNodeId = getNodeAtPosition(event.clientX, event.clientY);
      
      if (hoveredNodeId !== connectionInProgress.hoveredNode) {
        console.log('🎯 Hovering node changed:', hoveredNodeId);
        setConnectionInProgress(prev => ({
          ...prev,
          hoveredNode: hoveredNodeId,
          mousePosition: { x: event.clientX, y: event.clientY },
        }));
      }
    },
         [connectionInProgress.isConnecting, connectionInProgress.hoveredNode, getNodeAtPosition]
   );

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

  // Handle keyboard deletion for selected edges
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdges.length > 0) {
        console.log('🗑️ Deleting selected edges:', selectedEdges);
        setEdges((eds: Edge[]) => eds.filter(e => !selectedEdges.includes(e.id)));
        setSelectedEdges([]);
      }
    },
    [selectedEdges, setEdges, setSelectedEdges]
  );



  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('🎯 Drop event fired!');

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        console.error('❌ ReactFlow wrapper or instance not available:', {
          wrapper: !!reactFlowWrapper.current,
          instance: !!reactFlowInstance
        });
        return;
      }

      try {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        console.log('📏 ReactFlow bounds:', reactFlowBounds);
        
        // Try both data formats for compatibility
        let dragDataString = event.dataTransfer.getData('application/json');
        if (!dragDataString) {
          dragDataString = event.dataTransfer.getData('text/plain');
        }
        
        console.log('📦 Raw drag data:', dragDataString);
        
        if (!dragDataString) {
          console.error('❌ No drag data found in any format');
          console.log('📋 Available data types:', Array.from(event.dataTransfer.types));
          return;
        }

        const dragData = JSON.parse(dragDataString);
        console.log('🎯 Parsed drag data:', dragData);

        const dropPosition = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        console.log('📍 Drop position:', dropPosition, 'from client:', { x: event.clientX, y: event.clientY });

        // Use smart positioning to avoid overlaps
        const smartPosition = getSmartNodePosition(
          dragData.type,
          nodes,
          currentViewport,
          dropPosition,
          snapToGrid
        );

        console.log('🧠 Smart position calculated:', smartPosition);

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

        console.log('✅ Creating new node:', newNode);
        setNodes((nds: Node[]) => {
          console.log('📊 Current nodes:', nds.length, 'Adding node...');
          return nds.concat(newNode);
        });
      } catch (error) {
        console.error('❌ Error handling drop:', error);
      }
    },
    [reactFlowInstance, setNodes]
  );

  // Wrapper-specific handlers with different logs
  const onWrapperDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log('📦 WRAPPER DragOver event fired');
  }, []);

  const onWrapperDrop = useCallback((event: React.DragEvent) => {
    console.log('📦 WRAPPER Drop event fired!');
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

      console.log('✅ Adding node programmatically:', newNode, 'at smart position:', smartPosition);
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
          console.warn('⚠️ ReactFlow not ready for position calculation');
          return { x: clientX - 220, y: clientY - 100 };
        }
        
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const position = reactFlowInstance.project({
          x: clientX - reactFlowBounds.left,
          y: clientY - reactFlowBounds.top,
        });
        
        console.log('🎯 Calculated precise position:', position);
        return position;
      };
    }
  }, [handleAddNode, onAddNode, reactFlowInstance]);

  // Event listener para mouse move durante conexão
  React.useEffect(() => {
    if (connectionInProgress.isConnecting) {
      document.addEventListener('mousemove', handleMouseMove);
      console.log('👂 Mouse move listener added for connection tracking');
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [connectionInProgress.isConnecting, handleMouseMove]);

  // Debug: Global drop listener
  React.useEffect(() => {
    const handleGlobalDrop = (e: DragEvent) => {
      console.log('🌍 GLOBAL Drop detected at:', { x: e.clientX, y: e.clientY });
    };
    
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault(); // Allow drop
    };
    
    document.addEventListener('drop', handleGlobalDrop);
    document.addEventListener('dragover', handleGlobalDragOver);
    
    return () => {
      document.removeEventListener('drop', handleGlobalDrop);
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
      console.log('🗑️ Deleting edge from context menu:', contextMenu.edgeId);
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
            onClick={() => {
              console.log('🧪 Test Button: ReactFlow Instance:', !!reactFlowInstance);
              console.log('🧪 Test Button: Wrapper:', !!reactFlowWrapper.current);
              console.log('🧪 Test Button: Current nodes:', nodes.length);
              handleAddNode('test');
            }}
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
            🎯 Drag from sidebar | Space+Drag to pan | Right-click drag to pan | Scroll to zoom
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
        {/* DEBUG INFO */}
        {(() => {
          console.log('🔍 Canvas Render - nodes:', nodes.length, 'data:', nodes);
          console.log('🔍 Canvas Render - edges:', edges.length);
          console.log('🔍 Canvas Render - isLoaded:', isLoaded, 'isLoading:', isLoading);
          return null;
        })()}
        
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

          nodeTypes={nodeTypes}
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