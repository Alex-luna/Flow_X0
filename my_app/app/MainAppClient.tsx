"use client";
import React, { useRef, useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Canvas from "../components/Canvas";
import Header from "../components/Header";
import SplashScreen from "../components/SplashScreen";
import AdminPanel from "../components/AdminPanel";

interface Project {
  id: string;
  name: string;
  folder: string;
  lastModified: Date;
  status: 'active' | 'draft' | 'archived';
}

export default function MainAppClient() {
  const addNodeRef = useRef<((type: string, position?: { x: number; y: number }) => void) | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
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

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  const enterPresentationMode = async () => {
    try {
      // Request fullscreen
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      
      setIsPresentationMode(true);
      console.log('🎥 Entered presentation mode');
    } catch (error) {
      console.log('⚠️ Fullscreen not supported or denied, entering presentation mode anyway');
      setIsPresentationMode(true);
    }
  };

  const exitPresentationMode = async () => {
    try {
      // Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if ((document as any).webkitFullscreenElement) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msFullscreenElement) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.log('⚠️ Error exiting fullscreen:', error);
    }
    
    setIsPresentationMode(false);
    console.log('🎥 Exited presentation mode');
  };

  // Handle ESC key to exit presentation mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isPresentationMode) {
        event.preventDefault();
        exitPresentationMode();
      }
      // F11 key to toggle presentation mode
      if (event.key === 'F11') {
        event.preventDefault();
        if (isPresentationMode) {
          exitPresentationMode();
        } else {
          enterPresentationMode();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPresentationMode]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      // If fullscreen was exited externally, also exit presentation mode
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement && 
          !(document as any).msFullscreenElement && isPresentationMode) {
        setIsPresentationMode(false);
        console.log('🎥 Exited presentation mode (fullscreen ended)');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isPresentationMode]);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <div className="flex flex-col h-full w-full">
        {!isPresentationMode && (
          <Header 
            currentProject={currentProject} 
            onProjectChange={handleProjectChange}
            onEnterPresentationMode={enterPresentationMode}
          />
        )}
        <main className="flex flex-row flex-1 h-full overflow-hidden">
          {!isPresentationMode && <Sidebar onAddNode={handleAddNode} />}
          <div className="flex-1 h-full relative">
            <Canvas onAddNode={addNodeRef as any} isPresentationMode={isPresentationMode} />
            
            {/* Exit Presentation Mode Button */}
            {isPresentationMode && (
              <>
                {/* Overlay indicator */}
                <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-black/30 text-white px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20 animate-fade-in">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Modo Apresentação</span>
                </div>

                {/* Exit button */}
                <button
                  onClick={exitPresentationMode}
                  className="absolute top-4 right-4 z-50 group bg-black/20 hover:bg-black/40 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/20 animate-fade-in hover:scale-105"
                  title="Sair do modo apresentação (ESC ou F11)"
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm font-medium">Sair</span>
                    <kbd className="hidden sm:inline-block px-2 py-1 text-xs bg-white/10 rounded border border-white/20">ESC</kbd>
                  </div>
                </button>

                {/* Help text */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 animate-fade-in opacity-75">
                  <p className="text-sm text-center">
                    Pressione <kbd className="px-2 py-1 bg-white/20 rounded text-xs mx-1">ESC</kbd> ou 
                    <kbd className="px-2 py-1 bg-white/20 rounded text-xs mx-1">F11</kbd> para sair
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
        {!isPresentationMode && <AdminPanel />}
      </div>
    </>
  );
} 