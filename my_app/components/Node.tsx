"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import ComposedBlockIcon from './ComposedBlockIcon';
import ScreenIcon from './icons/ScreenIcon';
import UrlIcon from './icons/UrlIcon';
import SurveyIcon from './icons/SurveyIcon';
import SignupIcon from './icons/SignupIcon';
import CheckoutIcon from './icons/CheckoutIcon';
import GenericIcon from './icons/GenericIcon';
import CalendarIcon from './icons/CalendarIcon';
import ThankyouIcon from './icons/ThankyouIcon';
import UserIcon from './icons/UserIcon';
import PostIcon from './icons/PostIcon';
import DownloadIcon from './icons/DownloadIcon';
import PopupIcon from './icons/PopupIcon';
import CommentsIcon from './icons/CommentsIcon';
import CTA1Icon from './icons/CTA1Icon';
import CTA2Icon from './icons/CTA2Icon';
import CTA3Icon from './icons/CTA3Icon';

// Import geometric shape icons
import CircleIcon from './icons/CircleIcon';
import SquareIcon from './icons/SquareIcon';
import TriangleIcon from './icons/TriangleIcon';
import DiamondIcon from './icons/DiamondIcon';
import PentagonIcon from './icons/PentagonIcon';
import HexagonIcon from './icons/HexagonIcon';
import StarIcon from './icons/StarIcon';

const COLORS = [
  '#6366F1', // indigo (padrão)
  '#2563eb', // azul
  '#22c55e', // verde
  '#f59e42', // laranja
  '#ef4444', // vermelho
  '#a855f7', // roxo
  '#fbbf24', // amarelo
];

// Mapeamento de tipos para ícones
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  // Funnel steps
  url: UrlIcon,
  generic: GenericIcon,
  download: DownloadIcon,
  signup: SignupIcon,
  checkout: CheckoutIcon,
  calendar: CalendarIcon,
  survey: SurveyIcon,
  cta1: CTA1Icon,
  cta2: CTA2Icon,
  cta3: CTA3Icon,
  comments: CommentsIcon,
  post: PostIcon,
  user: UserIcon,
  thankyou: ThankyouIcon,
  popup: PopupIcon,
  // Geometric shapes
  circle: CircleIcon,
  square: SquareIcon,
  triangle: TriangleIcon,
  diamond: DiamondIcon,
  pentagon: PentagonIcon,
  hexagon: HexagonIcon,
  star: StarIcon,
};

interface CustomNodeData {
  label: string;
  type: string;
  color?: string;
  overlay?: React.ComponentType<any>;
  isConnectionTarget?: boolean; // Para highlight durante conexão
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData;
  onLabelUpdate?: (id: string, newLabel: string) => void; // Simple callback
}

const Node: React.FC<CustomNodeProps> = ({ id, data, selected, isConnectable, xPos, yPos, ...props }: CustomNodeProps) => {
  const [label, setLabel] = useState(data.label || '');
  const [color] = useState(data.color || COLORS[0]);
  const [editing, setEditing] = useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  // Sync label with external data changes
  React.useEffect(() => {
    if (!editing) {
      setLabel(data.label || '');
    }
  }, [data.label, editing]);

  // Verify if it's a funnel step (has type and icon)
  const isFunnelStep = data.type && ICON_MAP[data.type];
  const overlayIcon = isFunnelStep ? ICON_MAP[data.type] : null;

  // Simple save function
  const handleSave = () => {
    setEditing(false);
    const trimmedLabel = label.trim();
    if (trimmedLabel !== data.label && props.onLabelUpdate) {
      props.onLabelUpdate(id, trimmedLabel);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (editing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setEditing(false);
        setLabel(data.label || ''); // Reset to original
      }
    }
  };

  // Start editing on double click
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
  };

  // Focus when selected
  React.useEffect(() => {
    if (selected && nodeRef.current) {
      nodeRef.current.focus();
    }
  }, [selected]);

  // Renderização para funnel steps
  if (isFunnelStep) {
    return (
      <div className="relative" style={{ width: '105px', height: '175px' }}>
        {/* Main container - this will be the target for the selection ring */}
        <div 
          className={`relative w-[105px] h-[135px] bg-transparent cursor-pointer transition-all duration-200 focus:outline-none rounded-lg ${
            data.isConnectionTarget
              ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-transparent shadow-lg transform scale-105 animate-pulse'
              : selected 
                ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' 
                : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1 hover:ring-offset-transparent'
          }`}
          style={{ marginTop: '8px' }}
          tabIndex={0}
          ref={nodeRef}
          onDoubleClick={handleDoubleClick}
          onKeyDown={handleKeyDown}
        >
          {/* SVG positioned inside the main container */}
          <div className="absolute inset-0 w-[105px] h-[135px] z-0">
            {/* Base screen icon - scaled to exact container size */}
            <ScreenIcon 
              className="w-full h-full" 
              style={{ 
                width: '105px', 
                height: '135px',
                display: 'block'
              }} 
            />
            
            {/* Overlay icon - positioned within the screen content area */}
            {overlayIcon && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ top: '25px', bottom: '35px' }}>
                <div className="w-20 h-20 flex items-center justify-center">
                  {React.createElement(overlayIcon, { className: "w-full h-full" })}
                </div>
              </div>
            )}
          </div>
          {/* Connection handles - ALWAYS visible with high z-index */}
          <Handle
            id="target-left"
            type="target"
            position={Position.Left}
            className="w-3 h-3 bg-blue-500 border-2 border-white shadow-lg"
            style={{ 
              left: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 9999,
              position: 'absolute'
            }}
            isConnectable={isConnectable}
          />
          <Handle
            id="source-right"
            type="source"
            position={Position.Right}
            className="w-3 h-3 bg-blue-500 border-2 border-white shadow-lg"
            style={{ 
              right: '-8px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 9999,
              position: 'absolute'
            }}
            isConnectable={isConnectable}
          />
        </div>

        {/* Label container - positioned below with proper spacing */}
        <div className="absolute left-0 right-0 z-[10000]" style={{ top: '151px' }}>
          <div className="relative">
            {editing ? (
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-xs font-medium text-center bg-white border-2 border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg text-gray-900 z-[20000]"
                autoFocus
                placeholder="Digite o título..."
                style={{ minHeight: '20px', backgroundColor: 'white' }}
              />
            ) : (
              <div 
                className={`px-1 py-0.5 text-xs font-medium text-gray-700 text-center bg-white/90 backdrop-blur-sm rounded border border-gray-200 truncate shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md cursor-pointer`}
                title={`${label || 'Sem título'} - Duplo clique para editar`}
                onDoubleClick={handleDoubleClick}
              >
                {label || 'Sem título'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Renderização para blocos tradicionais
  return (
    <div className="relative">
      {/* Main node container */}
      <div 
        className={`relative w-20 h-8 px-2 py-1 bg-white border-2 rounded shadow-sm transition-all duration-200 flex items-center justify-center focus:outline-none ${
          data.isConnectionTarget
            ? 'border-green-400 shadow-lg ring-4 ring-green-400 ring-offset-2 ring-offset-white/50 transform scale-110 animate-pulse'
            : selected 
              ? 'border-blue-500 shadow-lg ring-2 ring-blue-500 ring-offset-2 ring-offset-white/50' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
        }`}
        style={{ backgroundColor: color }}
        tabIndex={0}
        ref={nodeRef}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {editing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className="w-full text-xs font-medium text-center bg-white border border-blue-500 focus:outline-none text-gray-900 rounded px-1"
              autoFocus
              placeholder="Digite o título..."
              style={{ minHeight: '16px', backgroundColor: 'white' }}
            />
          ) : (
            <span 
              className={`text-xs font-medium text-gray-700 truncate cursor-pointer`}
              title={`${label || 'Sem título'} - Duplo clique para editar`}
            >
              {label || 'Sem título'}
            </span>
          )}
        </div>

        {/* Connection handles */}
        <Handle
          id="traditional-target-left"
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-blue-500 border border-white"
          style={{ zIndex: 1000 }}
        />
        <Handle
          id="traditional-source-right"
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-blue-500 border border-white"
          style={{ zIndex: 1000 }}
        />
      </div>
    </div>
  );
};

export default memo(Node); 