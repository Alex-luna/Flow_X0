"use client";
import dynamic from "next/dynamic";
import React from "react";

const Canvas = dynamic(() => import("./Canvas"), { ssr: false });

export default function CanvasClient({ sidebarClickedBlock, onSidebarBlockConsumed }: {
  sidebarClickedBlock?: any;
  onSidebarBlockConsumed?: () => void;
}) {
  return <Canvas sidebarClickedBlock={sidebarClickedBlock} onSidebarBlockConsumed={onSidebarBlockConsumed} />;
} 