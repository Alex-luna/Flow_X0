import React, { useState } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

const COLORS = [
  '#2563eb', // azul
  '#22c55e', // verde
  '#f59e42', // laranja
  '#ef4444', // vermelho
  '#a855f7', // roxo
  '#fbbf24', // amarelo
];

export default function CustomNode({ id, data, selected, isConnectable, sourcePosition = Position.Right, targetPosition = Position.Left, xPos, yPos, ...props }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const [color, setColor] = useState(data.color || COLORS[0]);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  // Salva edição
  const handleBlur = () => {
    setEditing(false);
    if (props.dataUpdater) {
      props.dataUpdater(id, { ...data, label });
    }
  };

  // Atualiza cor
  const handleColorChange = (c: string) => {
    setColor(c);
    setShowColorMenu(false);
    if (props.dataUpdater) {
      props.dataUpdater(id, { ...data, color: c });
    }
  };

  // Foco visual ao selecionar
  React.useEffect(() => {
    if (selected && nodeRef.current && !editing) {
      nodeRef.current.focus();
    }
  }, [selected, editing]);

  // Mover node com setas
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!selected || editing) return;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = -16;
    if (e.key === 'ArrowDown') dy = 16;
    if (e.key === 'ArrowLeft') dx = -16;
    if (e.key === 'ArrowRight') dx = 16;
    if (dx !== 0 || dy !== 0) {
      e.preventDefault();
      if (props.dataUpdater) {
        props.dataUpdater(id, { _move: { x: (xPos ?? 0) + dx, y: (yPos ?? 0) + dy } });
      }
    }
  };

  return (
    <div
      ref={nodeRef}
      tabIndex={0}
      aria-label={`Bloco: ${label}`}
      style={{
        background: color,
        border: selected ? '2.5px solid #111' : '1.5px solid #888',
        outline: selected ? '2px solid #2563eb' : 'none',
        borderRadius: 8,
        minWidth: 120,
        minHeight: 48,
        padding: 8,
        position: 'relative',
        boxShadow: selected ? '0 0 0 2px #2563eb33' : 'none',
        transition: 'box-shadow 0.2s',
      }}
      onDoubleClick={() => setEditing(true)}
      onKeyDown={handleKeyDown}
      role="group"
    >
      <Handle type="target" position={targetPosition} isConnectable={isConnectable} />
      {editing ? (
        <input
          autoFocus
          value={label}
          onChange={e => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={e => e.key === 'Enter' && handleBlur()}
          className="w-full rounded px-1 py-0.5 text-sm border border-gray-300 focus:outline-blue-500"
          aria-label="Editar nome do bloco"
        />
      ) : (
        <span className="text-white font-semibold text-base cursor-pointer select-none" title="Duplo clique para editar">
          {label}
        </span>
      )}
      <button
        className="absolute top-1 right-1 w-5 h-5 rounded-full border border-white bg-white/70 flex items-center justify-center text-xs text-gray-700 hover:bg-white"
        style={{ outline: selected ? '2px solid #2563eb' : 'none' }}
        onClick={e => { e.stopPropagation(); setShowColorMenu(v => !v); }}
        title="Alterar cor"
        aria-label="Alterar cor do bloco"
      >
        🎨
      </button>
      {showColorMenu && (
        <div className="absolute z-10 top-7 right-1 bg-white rounded shadow p-1 flex gap-1">
          {COLORS.map(c => (
            <button
              key={c}
              className="w-5 h-5 rounded-full border-2 border-white hover:scale-110 transition"
              style={{ background: c }}
              onClick={() => handleColorChange(c)}
              aria-label={`Selecionar cor ${c}`}
            />
          ))}
        </div>
      )}
      <Handle type="source" position={sourcePosition} isConnectable={isConnectable} />
    </div>
  );
} 