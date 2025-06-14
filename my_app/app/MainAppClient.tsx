"use client";
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import CanvasClient from "../components/CanvasClient";

export default function MainAppClient() {
  const [clickedBlock, setClickedBlock] = useState(null);
  return (
    <main className="flex flex-row w-full flex-1 max-w-7xl mx-auto">
      <Sidebar onBlockClick={block => setClickedBlock(block)} />
      <div className="flex-1 px-4">
        <CanvasClient sidebarClickedBlock={clickedBlock} onSidebarBlockConsumed={() => setClickedBlock(null)} />
      </div>
    </main>
  );
} 