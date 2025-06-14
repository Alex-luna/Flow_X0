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

const Node: React.FC<CustomNodeProps> = ({ id, data, selected, isConnectable, sourcePosition = Position.Right, targetPosition = Position.Left, xPos, yPos, ...props }: CustomNodeProps) => {
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
    return (
      <div className="relative">
        {/* Selection ring */}
        {selected && (
          <div className="absolute -inset-1 bg-blue-500 rounded-lg opacity-20 z-0" />
        )}
        
        {/* Main node container */}
        <div 
          className={`relative w-[105px] h-[135px] bg-white border-2 rounded-lg shadow-sm transition-all duration-200 ${
            selected 
              ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
              : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }`}
          onDoubleClick={() => setEditing(true)}
          onKeyDown={handleKeyDown}
        >
          {/* Icon container with proper z-index */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="relative w-16 h-20">
              {/* Base screen icon */}
              <div className="absolute inset-0 z-10">
                <ScreenIcon className="w-full h-full" />
              </div>
              
              {/* Overlay icon */}
              {overlayIcon && (
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {React.createElement(overlayIcon, { className: "w-full h-full" })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Label container positioned below icon */}
          <div className="absolute -bottom-6 left-0 right-0">
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
              <div className="px-1 py-0.5 text-xs font-medium text-gray-700 text-center bg-white/90 backdrop-blur-sm rounded border border-gray-200 truncate">
                {label}
              </div>
            )}
          </div>

          {/* Connection handles */}
          <Handle
            type="target"
            position={Position.Top}
            className="w-3 h-3 bg-blue-500 border-2 border-white"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            className="w-3 h-3 bg-blue-500 border-2 border-white"
          />
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
          type="target"
          position={Position.Left}
          className="w-2 h-2 bg-blue-500 border border-white"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 bg-blue-500 border border-white"
        />
      </div>
    </div>
  );
};

export default memo(Node); 