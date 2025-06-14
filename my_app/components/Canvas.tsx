import React from 'react';
import ReactFlow, { Background, Controls, MiniMap, Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';

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
  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={16} />
      </ReactFlow>
    </div>
  );
};

export default Canvas; 