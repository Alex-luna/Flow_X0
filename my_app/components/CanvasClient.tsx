"use client";
import dynamic from "next/dynamic";
import React from "react";

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

export default function CanvasClient({ onAddNode }: {
  onAddNode: (type: string, position?: { x: number; y: number }) => void;
}) {
  return <Canvas onAddNode={onAddNode} />;
} 