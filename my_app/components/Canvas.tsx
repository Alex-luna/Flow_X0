import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  OnConnect,
  OnNodesChange,
  OnEdgesChange,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

import CustomNode from './Node';

const nodeTypes = {
  custom: CustomNode,
};

// Animated edge style: dashed and animated
const animatedEdgeStyle = {
  stroke: '#2563eb',
  strokeWidth: 2,
  strokeDasharray: '6 4',
};

const selectedEdgeStyle = {
  stroke: '#ef4444', // red color for selected
  strokeWidth: 3,
  strokeDasharray: '6 4',
};

const edgeOptions = {
  animated: true,
  style: animatedEdgeStyle,
  focusable: true,
  deletable: true,
};

interface CanvasProps {
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
}

const Canvas: React.FC<CanvasProps> = ({ onAddNode }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange]: [Node[], any, OnNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange]: [Edge[], any, OnEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [selectedEdges, setSelectedEdges] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    edgeId: string | null;
  }>({ show: false, x: 0, y: 0, edgeId: null });
  const [showMiniMap, setShowMiniMap] = useState(true);

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
    [setEdges]
  );

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

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    console.log('🎯 DragOver event fired');
  }, []);

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

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        console.log('📍 Drop position:', position, 'from client:', { x: event.clientX, y: event.clientY });

        // Create new node with proper data structure
        const newNode: Node = {
          id: `${dragData.type}-${Date.now()}`,
          type: 'custom',
          position,
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
    const newPosition = position || { x: 250, y: 250 };
    
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'custom',
      position: newPosition,
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        type: type,
        color: '#6366F1',
      },
    };

    console.log('✅ Adding node programmatically:', newNode);
    setNodes((nds: Node[]) => nds.concat(newNode));
  }, [setNodes]);

  // Pass the handler to parent
  React.useEffect(() => {
    if (onAddNode) {
      // Replace the parent's onAddNode with our handler
      (onAddNode as any).current = handleAddNode;
      // Also pass ReactFlow instance and wrapper for manual drop calculation
      (onAddNode as any).getDropPosition = (clientX: number, clientY: number) => {
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
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleAddNode('generic')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
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
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
          >
            Test
          </button>
          
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <input
              type="checkbox"
              checked={snapToGrid}
              onChange={e => setSnapToGrid(e.target.checked)}
              className="accent-blue-600"
            />
            Snap to Grid
          </label>

          <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
            <input
              type="checkbox"
              checked={showMiniMap}
              onChange={e => setShowMiniMap(e.target.checked)}
              className="accent-blue-600"
            />
            Show Mini Map
          </label>
        </div>
        
        <div className="text-sm text-gray-500">
          🎯 Drag from sidebar | Space+Drag to pan | Right-click drag to pan | Scroll to zoom
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
          nodes={nodes}
          edges={styledEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneClick={onPaneClick}
          onInit={setReactFlowInstance}
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
          connectionLineStyle={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '6 4' }}
          deleteKeyCode={['Delete', 'Backspace']}
          onlyRenderVisibleElements={false}
          preventScrolling={false}
        >
          <Controls />
          {showMiniMap && (
            <MiniMap 
              nodeColor={(node) => {
                if (node.data.type && node.data.type !== 'generic') {
                  return '#6366F1'; // Blue for funnel steps
                }
                return node.data.color || '#6366F1';
              }}
              nodeStrokeColor="#ffffff"
              nodeStrokeWidth={2}
              nodeBorderRadius={8}
              maskColor="rgba(0, 0, 0, 0.1)"
              style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              position="bottom-right"
              pannable
              zoomable
              ariaLabel="Canvas mini map for navigation"
            />
          )}
          <Background gap={16} />
        </ReactFlow>
        
        {/* Context Menu */}
        {contextMenu.show && (
          <div
            className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-[10000] py-1"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
            }}
          >
            <button
              onClick={handleContextMenuDelete}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <span className="text-red-500">🗑️</span>
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