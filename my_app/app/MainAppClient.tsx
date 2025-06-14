"use client";
import React, { useRef } from "react";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";

export default function MainAppClient() {
  const addNodeRef = useRef<((type: string, position?: { x: number; y: number }) => void) | null>(null);

  const handleAddNode = (type: string, position?: { x: number; y: number }) => {
    if (addNodeRef.current) {
      addNodeRef.current(type, position);
    }
  };

  return (
    <main className="flex flex-row w-full flex-1 max-w-7xl mx-auto h-full">
      <Sidebar onAddNode={handleAddNode} />
      <div className="flex-1">
        <Canvas onAddNode={addNodeRef as any} />
      </div>
    </main>
  );
} 