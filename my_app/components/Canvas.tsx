import React, { useCallback, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, ReactFlowInstance } from 'reactflow';
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

const Canvas: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);
  const [selectedNodes, setSelectedNodes] = React.useState<string[]>([]);

  // Adicionar novo node
  const handleAddNode = useCallback(() => {
    const newNode: Node = {
      id: getId(),
      type: 'default',
      data: { label: `Novo Bloco` },
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);

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

  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={handleAddNode}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Adicionar Bloco
      </button>
      <div
        ref={reactFlowWrapper}
        className="w-full h-[70vh] max-h-[800px] min-h-[400px] bg-white dark:bg-neutral-900 rounded-xl shadow border"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={(instance) => (reactFlowInstance.current = instance)}
          onSelectionChange={onSelectionChange}
          fitView
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