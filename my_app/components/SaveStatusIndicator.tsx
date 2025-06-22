"use client";

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'idle';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaveTime?: Date | null;
  className?: string;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ 
  status, 
  lastSaveTime, 
  className = '' 
}) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'saved':
        return {
          color: theme.colors.accent.success,
          label: 'Auto-saved',
          description: lastSaveTime 
            ? `Last saved at ${lastSaveTime.toLocaleTimeString()}` 
            : 'Changes saved automatically',
          animation: ''
        };
      case 'saving':
        return {
          color: theme.colors.accent.warning,
          label: 'Saving...',
          description: 'Saving your changes',
          animation: 'animate-pulse'
        };
      case 'error':
        return {
          color: theme.colors.accent.danger,
          label: 'Save failed',
          description: 'Failed to save changes. Will retry automatically.',
          animation: 'animate-bounce'
        };
      case 'idle':
      default:
        return {
          color: theme.colors.text.tertiary,
          label: 'Ready',
          description: 'Ready to save changes',
          animation: ''
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={`relative group ${className}`}>
      {/* Status Indicator Dot */}
      <div 
        className={`w-3 h-3 rounded-full transition-all duration-300 ease-in-out ${statusConfig.animation}`}
        style={{ 
          backgroundColor: statusConfig.color,
          boxShadow: status === 'saving' ? `0 0 0 4px ${statusConfig.color}20` : undefined 
        }}
        aria-label={statusConfig.label}
        role="status"
      />
      
      {/* Tooltip */}
      <div 
        className={`absolute bottom-full right-0 mb-2 px-3 py-2 text-xs font-medium rounded-lg shadow-lg pointer-events-none
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap`}
        style={{
          backgroundColor: theme.colors.background.elevated,
          color: theme.colors.text.primary,
          border: `1px solid ${theme.colors.border.primary}`,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="font-semibold" style={{ color: statusConfig.color }}>
          {statusConfig.label}
        </div>
        <div className="mt-1" style={{ color: theme.colors.text.secondary }}>
          {statusConfig.description}
        </div>
        
        {/* Tooltip Arrow */}
        <div 
          className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent"
          style={{ borderTopColor: theme.colors.background.elevated }}
        />
      </div>
    </div>
  );
}; 