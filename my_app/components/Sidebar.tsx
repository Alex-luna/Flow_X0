"use client";

import React, { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// Import all funnel step icons
import UrlIcon from './icons/UrlIcon';
import GenericIcon from './icons/GenericIcon';
import DownloadIcon from './icons/DownloadIcon';
import SignupIcon from './icons/SignupIcon';
import CheckoutIcon from './icons/CheckoutIcon';
import CalendarIcon from './icons/CalendarIcon';
import SurveyIcon from './icons/SurveyIcon';
import CTA1Icon from './icons/CTA1Icon';
import CTA2Icon from './icons/CTA2Icon';
import CTA3Icon from './icons/CTA3Icon';
import CommentsIcon from './icons/CommentsIcon';
import PostIcon from './icons/PostIcon';
import UserIcon from './icons/UserIcon';
import ThankyouIcon from './icons/ThankyouIcon';
import PopupIcon from './icons/PopupIcon';

// Import geometric shape icons
import CircleIcon from './icons/CircleIcon';
import SquareIcon from './icons/SquareIcon';
import TriangleIcon from './icons/TriangleIcon';
import DiamondIcon from './icons/DiamondIcon';
import PentagonIcon from './icons/PentagonIcon';
import HexagonIcon from './icons/HexagonIcon';
import StarIcon from './icons/StarIcon';
import SearchIcon from './icons/SearchIcon';

interface BlockItem {
  id: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  overlay?: React.ComponentType<{ className?: string }>;
}

const funnelSteps: BlockItem[] = [
  { id: 'url', type: 'url', label: 'URL', icon: UrlIcon },
  { id: 'generic', type: 'generic', label: 'Generic', icon: GenericIcon },
  { id: 'download', type: 'download', label: 'Download', icon: DownloadIcon },
  { id: 'signup', type: 'signup', label: 'Sign Up', icon: SignupIcon },
  { id: 'checkout', type: 'checkout', label: 'Checkout', icon: CheckoutIcon },
  { id: 'calendar', type: 'calendar', label: 'Calendar', icon: CalendarIcon },
  { id: 'survey', type: 'survey', label: 'Survey', icon: SurveyIcon },
  { id: 'cta1', type: 'cta1', label: 'CTA', icon: CTA1Icon },
  { id: 'cta2', type: 'cta2', label: 'CTA 2', icon: CTA2Icon },
  { id: 'cta3', type: 'cta3', label: 'CTA 3', icon: CTA3Icon },
  { id: 'comments', type: 'comments', label: 'Comments', icon: CommentsIcon },
  { id: 'post', type: 'post', label: 'Post', icon: PostIcon },
  { id: 'user', type: 'user', label: 'User', icon: UserIcon },
  { id: 'thankyou', type: 'thankyou', label: 'Thank you', icon: ThankyouIcon },
  { id: 'popup', type: 'popup', label: 'Popup', icon: PopupIcon },
];

const traditionalBlocks: BlockItem[] = [
  // Geometric shapes
  { id: 'circle', type: 'circle', label: 'Círculo', icon: CircleIcon },
  { id: 'square', type: 'square', label: 'Quadrado', icon: SquareIcon },
  { id: 'triangle', type: 'triangle', label: 'Triângulo', icon: TriangleIcon },
  { id: 'diamond', type: 'diamond', label: 'Losango', icon: DiamondIcon },
  { id: 'pentagon', type: 'pentagon', label: 'Pentágono', icon: PentagonIcon },
  { id: 'hexagon', type: 'hexagon', label: 'Hexágono', icon: HexagonIcon },
  { id: 'star', type: 'star', label: 'Estrela', icon: StarIcon },
  // Traditional flowchart elements
  { id: 'decision', type: 'decision', label: 'Decision', icon: GenericIcon },
  { id: 'process', type: 'process', label: 'Process', icon: GenericIcon },
  { id: 'data', type: 'data', label: 'Data', icon: GenericIcon },
  { id: 'connector', type: 'connector', label: 'Connector', icon: GenericIcon },
];

interface SidebarProps {
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('funnel');
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<BlockItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter blocks based on search term
  const getFilteredBlocks = (blocks: BlockItem[]) => {
    if (!searchTerm.trim()) {
      return blocks;
    }
    
    return blocks.filter(block =>
      block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredFunnelSteps = useMemo(() => getFilteredBlocks(funnelSteps), [searchTerm]);
  const filteredTraditionalBlocks = useMemo(() => getFilteredBlocks(traditionalBlocks), [searchTerm]);

  const handleDragStart = (event: React.DragEvent, item: BlockItem) => {
    try {
      setIsDragging(true);
      setDraggedItem(item);
      
      // Create a simple serializable object
      const dragData = {
        type: item.type,
        label: item.label,
        id: item.id
      };
      
      // Set both data formats for compatibility
      event.dataTransfer.setData('application/json', JSON.stringify(dragData));
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'copy';
      
    } catch (error) {
      console.error('❌ Error in handleDragStart:', error);
    }
  };

  const handleDragEnd = (event: React.DragEvent) => {
    if (isDragging && draggedItem) {
      // Check if mouse is over canvas area (approximate)
      const isOverCanvas = event.clientX > 220; // Sidebar width
      
      if (isOverCanvas) {
        console.log('🎯 MANUAL DROP: Adding node at mouse position');
        
        // Use precise ReactFlow position calculation if available
        let position = { x: event.clientX - 220, y: event.clientY - 100 };
        
        if (onAddNode && typeof onAddNode === 'object' && 'getDropPosition' in onAddNode) {
          const onAddNodeRef = onAddNode as any;
          const getDropPosition = onAddNodeRef.getDropPosition;
          if (typeof getDropPosition === 'function') {
            position = getDropPosition(event.clientX, event.clientY);
          }
        }
        
        onAddNode(draggedItem.type, position);
        console.log('✅ Node added via manual drop:', draggedItem.type, 'at', position);
      } else {
        console.log('🚫 Drag ended outside canvas area');
      }
    }
    
    setIsDragging(false);
    setDraggedItem(null);
  };

  const handleClick = (item: BlockItem) => {
    try {
      // Add node using smart positioning (no fixed position)
      onAddNode(item.type);
      console.log('✅ Node added via click:', item.type, '- using smart positioning');
    } catch (error) {
      console.error('❌ Error in handleClick:', error);
    }
  };

  const renderBlockGrid = (blocks: BlockItem[]) => {
    if (blocks.length === 0) {
      return (
        <div className="p-6 text-center">
          <p 
            className="text-sm"
            style={{ color: theme.colors.text.secondary }}
          >
            Nenhum item encontrado para "{searchTerm}"
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-4 p-4">
        {blocks.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              draggable={true}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={(e) => handleDragEnd(e)}
              onClick={() => handleClick(item)}
              className="flex flex-col items-center justify-center p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing min-h-[80px] select-none hover:brightness-110"
              style={{
                backgroundColor: theme.colors.background.elevated,
                borderColor: theme.colors.border.primary,
                border: '1px solid'
              }}
              role="button"
              tabIndex={0}
              aria-label={`Add ${item.label} node`}
            >
              <div className="flex items-center justify-center w-10 h-10 mb-2">
                <IconComponent className="w-full h-full" />
              </div>
              <span 
                className="text-xs font-medium text-center leading-tight"
                style={{ color: theme.colors.text.primary }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div 
      className="w-[220px] h-full flex flex-col border-r"
      style={{ 
        backgroundColor: theme.colors.background.secondary,
        borderColor: theme.colors.border.primary
      }}
    >
      {/* Custom Tabs Implementation */}
      <div className="flex flex-col h-full">
        <div className="p-4 border-b" style={{ borderColor: theme.colors.border.primary }}>
          <div 
            className="grid grid-cols-2 rounded-lg border"
            style={{ 
              backgroundColor: theme.colors.background.elevated,
              borderColor: theme.colors.border.primary
            }}
          >
            <button
              onClick={() => setActiveTab('blocks')}
              className={`px-3 py-2 text-sm font-medium rounded-l-lg transition-all`}
              style={{
                backgroundColor: activeTab === 'blocks' ? theme.colors.accent.primary : 'transparent',
                color: activeTab === 'blocks' ? theme.colors.text.inverse : theme.colors.text.secondary,
                borderRight: `1px solid ${theme.colors.border.primary}`
              }}
            >
              Blocos
            </button>
            <button
              onClick={() => setActiveTab('funnel')}
              className={`px-3 py-2 text-sm font-medium rounded-r-lg transition-all`}
              style={{
                backgroundColor: activeTab === 'funnel' ? theme.colors.accent.primary : 'transparent',
                color: activeTab === 'funnel' ? theme.colors.text.inverse : theme.colors.text.secondary
              }}
            >
              Funnel Steps
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b" style={{ borderColor: theme.colors.border.primary }}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon 
                className="w-4 h-4 text-gray-400"
              />
            </div>
            <input
              type="text"
              placeholder="Buscar nodes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2"
              style={{
                backgroundColor: theme.colors.background.elevated,
                borderColor: theme.colors.border.primary,
                color: theme.colors.text.primary,
                '--tw-ring-color': theme.colors.accent.primary,
              } as React.CSSProperties}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:opacity-75 transition-opacity"
                aria-label="Limpar busca"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: theme.colors.text.tertiary }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'blocks' && renderBlockGrid(filteredTraditionalBlocks)}
          {activeTab === 'funnel' && renderBlockGrid(filteredFunnelSteps)}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 