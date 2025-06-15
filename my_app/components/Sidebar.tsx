import React, { useState } from 'react';
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

  const handleDragStart = (event: React.DragEvent, item: BlockItem) => {
    try {
      console.log('🚀 Drag started for item:', item);
      setIsDragging(true);
      setDraggedItem(item);
      
      // Create a simple serializable object
      const dragData = {
        type: item.type,
        label: item.label,
        id: item.id
      };
      
      console.log('📦 Setting drag data:', dragData);
      
      // Set both data formats for compatibility
      event.dataTransfer.setData('application/json', JSON.stringify(dragData));
      event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      event.dataTransfer.effectAllowed = 'copy';
      
      console.log('✅ Drag data set successfully');
      console.log('📋 DataTransfer types set:', Array.from(event.dataTransfer.types));
    } catch (error) {
      console.error('❌ Error in handleDragStart:', error);
    }
  };

  const handleDragEnd = (event: React.DragEvent) => {
    console.log('🏁 Drag ended at position:', { x: event.clientX, y: event.clientY });
    
    if (isDragging && draggedItem) {
      // Check if mouse is over canvas area (approximate)
      const isOverCanvas = event.clientX > 220; // Sidebar width
      
      if (isOverCanvas) {
        console.log('🎯 MANUAL DROP: Adding node at mouse position');
        
        // Use precise ReactFlow position calculation if available
        let position = { x: event.clientX - 220, y: event.clientY - 100 };
        
        if ((onAddNode as any).getDropPosition) {
          position = (onAddNode as any).getDropPosition(event.clientX, event.clientY);
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
      // Add node at center of canvas when clicked
      onAddNode(item.type, { x: 250, y: 250 });
      console.log('✅ Node added via click:', item.type);
    } catch (error) {
      console.error('❌ Error in handleClick:', error);
    }
  };

  const renderBlockGrid = (blocks: BlockItem[]) => (
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
                backgroundColor: activeTab === 'blocks' ? theme.colors.background.tertiary : 'transparent',
                color: activeTab === 'blocks' ? theme.colors.text.primary : theme.colors.text.secondary,
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

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'blocks' && renderBlockGrid(traditionalBlocks)}
          {activeTab === 'funnel' && renderBlockGrid(funnelSteps)}
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 