"use client";

import { useState } from "react";

// Simplified mock types for development
export interface ProjectData {
  id: string;
  name: string;
  description?: string;
  folderId?: string;
  status: "active" | "archived" | "draft";
  lastModified: Date;
  createdAt: Date;
}

export interface UseProjectsReturn {
  projects: ProjectData[];
  loading: boolean;
  error: string | null;
}

/**
 * Simplified mock hook for projects - for development only
 * This will be replaced with real Convex integration later
 */
export const useProjects = (): UseProjectsReturn => {
  console.log('🚀 useProjects mock hook initialized');

  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  // Mock projects data
  const projects: ProjectData[] = [
    {
      id: '1',
      name: 'Lead Generation Funnel',
      description: 'Main lead generation flow',
      folderId: 'work',
      status: 'active',
      lastModified: new Date(),
      createdAt: new Date(),
    },
    {
      id: '2',
      name: 'E-commerce Flow',
      description: 'Customer purchase journey',
      folderId: 'personal',
      status: 'draft',
      lastModified: new Date(),
      createdAt: new Date(),
    },
  ];

  return {
    projects,
    loading,
    error,
  };
}; 