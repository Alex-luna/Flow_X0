"use client";

import { useState } from "react";

// Simplified mock types for development
export interface FolderData {
  id: string;
  name: string;
  color: string;
  projectCount: number;
  createdAt: Date;
}

export interface UseFoldersReturn {
  folders: FolderData[];
  loading: boolean;
  error: string | null;
}

/**
 * Simplified mock hook for folders - for development only
 * This will be replaced with real Convex integration later
 */
export const useFolders = (): UseFoldersReturn => {
  console.log('🚀 useFolders mock hook initialized');

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Mock folders data
  const folders: FolderData[] = [
    {
      id: 'personal',
      name: 'Personal',
      color: '#3b82f6',
      projectCount: 3,
      createdAt: new Date(),
    },
    {
      id: 'work',
      name: 'Work',
      color: '#10b981',
      projectCount: 5,
      createdAt: new Date(),
    },
    {
      id: 'clients',
      name: 'Clients',
      color: '#f59e0b',
      projectCount: 2,
      createdAt: new Date(),
    },
  ];

  return {
    folders,
    loading,
    error,
  };
}; 