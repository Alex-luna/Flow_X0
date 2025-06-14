import React, { useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, ReactFlowInstance, addEdge, Connection, EdgeTypes } from 'reactflow';
import CustomNode from './Node';
import 'reactflow/dist/style.css';

let id = 2;
const getId = () => `${id++}`;

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    data: { label: 'Node de Exemplo' },
    position: { x: 250, y: 150 },
  },
];

const initialEdges: Edge[] = [];

// Custom edge style: dashed and animated
const animatedEdgeStyle = {
  stroke: '#2563eb',
  strokeWidth: 2,
  strokeDasharray: '6 4',
};

const edgeOptions = {
  animated: true,
  style: animatedEdgeStyle,
};

const nodeTypes = { custom: CustomNode };

const Canvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [selectedNodes, setSelectedNodes] = React.useState<string[]>([]);
  const [snapToGrid, setSnapToGrid] = React.useState(true);

  // Adicionar novo node
  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: getId(),
      type: 'custom',
      data: { label: `Novo Bloco`, color: '#2563eb' },
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

  // Atualiza dados do node (label/cor)
  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      if (newData._move) {
        return { ...n, position: { x: newData._move.x, y: newData._move.y } };
      }
      return { ...n, data: { ...n.data, ...newData } };
    }));
  };

  // Seleção de nodes
  const onSelectionChange = useCallback((params: { nodes: Node[] }) => {
    setSelectedNodes(params.nodes.map((n: Node) => n.id));
  }, []);

  // Deletar node com tecla Delete
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' && selectedNodes.length > 0) {
        setNodes((nds) => nds.filter((n) => !selectedNodes.includes(n.id)));
        setSelectedNodes([]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, setNodes]);

  // Permitir criar conexões entre nodes, mas impedir conexões inválidas
  const onConnect = useCallback((params: Edge | Connection) => {
    // Impede conexão de um node para ele mesmo
    if (params.source === params.target) return;
    // Impede conexões duplicadas
    setEdges((eds) => {
      const exists = eds.some(e => e.source === params.source && e.target === params.target);
      if (exists) return eds;
      return addEdge({ ...params, ...edgeOptions }, eds);
    });
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleAddNode}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Adicionar Bloco
        </button>
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={e => setSnapToGrid(e.target.checked)}
            className="accent-blue-600"
          />
          Snap to grid
        </label>
      </div>
      <div
        ref={reactFlowWrapper}
        className="w-full h-[70vh] max-h-[800px] min-h-[400px] bg-white dark:bg-neutral-900 rounded-xl shadow border"
      >
        <ReactFlow
          nodes={nodes.map((n) => n.type === 'custom' ? { ...n, data: { ...n.data, dataUpdater: updateNodeData } } : n)}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={(instance) => (reactFlowInstance.current = instance)}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          panOnDrag={[1, 2]}
          minZoom={0.5}
          maxZoom={2}
          nodeDragThreshold={1}
          nodeOrigin={[0.5, 0.5]}
          snapToGrid={snapToGrid}
          snapGrid={[16, 16]}
          nodeExtent={[[0, 0], [1000, 1000]]}
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default Canvas; 