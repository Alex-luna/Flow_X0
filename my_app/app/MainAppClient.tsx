"use client";
import React, { useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";
import Header from "../components/Header";

interface Project {
  id: string;
  name: string;
  folder: string;
  lastModified: Date;
  status: 'active' | 'draft' | 'archived';
}

export default function MainAppClient() {
  const addNodeRef = useRef<((type: string, position?: { x: number; y: number }) => void) | null>(null);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: '1',
    name: 'Lead Generation Funnel',
    folder: 'marketing',
    lastModified: new Date(),
    status: 'active'
  });

  const handleAddNode = (type: string, position?: { x: number; y: number }) => {
    if (addNodeRef.current) {
      addNodeRef.current(type, position);
    }
  };

  const handleProjectChange = (project: Project) => {
    setCurrentProject(project);
    console.log('🎯 Project changed to:', project.name);
  };

  return (
    <div className="flex flex-col h-screen w-full">
      <Header 
        currentProject={currentProject} 
        onProjectChange={handleProjectChange}
      />
      <main className="flex flex-row w-full flex-1 max-w-7xl mx-auto h-full">
        <Sidebar onAddNode={handleAddNode} />
        <div className="flex-1">
          <Canvas onAddNode={addNodeRef as any} />
        </div>
      </main>
    </div>
  );
} 