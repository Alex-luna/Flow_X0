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
};

interface CustomNodeData {
  label: string;
  type: string;
  color?: string;
  overlay?: React.ComponentType<any>;
}

interface CustomNodeProps extends NodeProps {
  data: CustomNodeData;
  dataUpdater?: (id: string, newData: any) => void;
}

const Node: React.FC<CustomNodeProps> = ({ id, data, selected, isConnectable, xPos, yPos, ...props }: CustomNodeProps) => {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label || '');
  const [color, setColor] = useState(data.color || COLORS[0]);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const nodeRef = React.useRef<HTMLDivElement>(null);

  // Verifica se é um funnel step (tem tipo e ícone)
  const isFunnelStep = data.type && ICON_MAP[data.type];
  const overlayIcon = isFunnelStep ? ICON_MAP[data.type] : null;

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

  // Renderização para funnel steps
  if (isFunnelStep) {
    // Calculate responsive icon size (15% of container width)
    const iconSizeClass = 'w-16 h-16'; // Default size for 105px container
    const topSpacing = '30px'; // 30/135 = ~22% from top
    const bottomSpacing = '40px'; // 40/135 = ~30% from bottom

    return (
      <div className="relative">
        {/* SVG positioned behind everything */}
        <div className="absolute inset-0 w-[105px] h-[135px] z-0" style={{ marginTop: '8px', marginBottom: '32px' }}>
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

        {/* Selection ring */}
        {selected && (
          <div className="absolute -inset-1 bg-blue-500 rounded-lg opacity-20 z-10" style={{ marginTop: '7px', marginBottom: '31px' }} />
        )}
        
        {/* Invisible clickable container - maintains functionality */}
        <div 
          className={`relative w-[105px] h-[135px] bg-transparent cursor-pointer transition-all duration-200 ${
            selected 
              ? 'ring-2 ring-blue-500 ring-offset-2' 
              : ''
          }`}
          onDoubleClick={() => setEditing(true)}
          onKeyDown={handleKeyDown}
          style={{ marginTop: '8px', marginBottom: '32px', zIndex: 20 }}
          tabIndex={0}
          ref={nodeRef}
        >
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

        {/* Label container - positioned outside with proper spacing */}
        <div className="absolute -bottom-10 left-0 right-0 z-[10000]">
          {editing ? (
            <input
              type="text"
              value={label}
              onChange={e => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={e => e.key === 'Enter' && handleBlur()}
              className="w-full px-1 py-0.5 text-xs font-medium text-center bg-white border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <div className="px-1 py-0.5 text-xs font-medium text-gray-700 text-center bg-white/90 backdrop-blur-sm rounded border border-gray-200 truncate shadow-sm">
              {label}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderização para blocos tradicionais
  return (
    <div className="relative">
      {/* Selection ring */}
      {selected && (
        <div className="absolute -inset-1 bg-blue-500 rounded opacity-20 z-0" />
      )}
      
      {/* Main node container */}
      <div 
        className={`relative w-20 h-8 px-2 py-1 bg-white border-2 rounded shadow-sm transition-all duration-200 flex items-center justify-center ${
          selected 
            ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
        }`}
        style={{ backgroundColor: color }}
        onDoubleClick={() => setEditing(true)}
        onKeyDown={handleKeyDown}
      >
        {editing ? (
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={e => e.key === 'Enter' && handleBlur()}
            className="w-full text-xs font-medium text-center bg-transparent border-none focus:outline-none"
            autoFocus
          />
        ) : (
          <span className="text-xs font-medium text-gray-700 truncate">
            {label}
          </span>
        )}

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