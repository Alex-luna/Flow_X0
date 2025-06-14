import React from 'react';

const BLOCKS = [
  { type: 'webpage', label: 'Web Page', color: '#2563eb', icon: '🌐' },
  { type: 'cta', label: 'CTA', color: '#22c55e', icon: '⚡' },
  { type: 'email', label: 'Email', color: '#f59e42', icon: '✉️' },
  { type: 'funnel', label: 'Funnel Step', color: '#a855f7', icon: '🔗' },
];

export default function Sidebar({ onBlockClick }: { onBlockClick?: (block: typeof BLOCKS[0]) => void }) {
  // Drag start handler
  const handleDragStart = (e: React.DragEvent, block: typeof BLOCKS[0]) => {
    e.dataTransfer.setData('application/reactflow', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="w-48 min-w-[160px] bg-neutral-50 dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col gap-4 h-full">
      <h2 className="text-lg font-bold mb-2 text-neutral-700 dark:text-neutral-200">Blocos</h2>
      <div className="flex flex-col gap-3">
        {BLOCKS.map((block) => (
          <div
            key={block.type}
            className="flex items-center gap-2 p-2 rounded cursor-pointer border border-transparent hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 transition select-none"
            style={{ background: block.color + '22' }}
            draggable
            onDragStart={e => handleDragStart(e, block)}
            onClick={() => onBlockClick?.(block)}
            tabIndex={0}
            role="button"
            aria-label={`Adicionar bloco ${block.label}`}
          >
            <span className="text-xl" aria-hidden>{block.icon}</span>
            <span className="font-medium text-sm text-neutral-800 dark:text-neutral-100">{block.label}</span>
          </div>
        ))}
      </div>
    </aside>
  );
} 