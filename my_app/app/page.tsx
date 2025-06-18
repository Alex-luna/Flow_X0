"use client";

import { useState, useEffect } from 'react';
import MainAppClient from "./MainAppClient";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConvexClientProvider } from "../contexts/ConvexProvider";
import { ProjectProvider } from "../contexts/ProjectContext";
import NoSSR from "../components/NoSSR";

function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Flow X...</p>
      </div>
    </div>
  );
}

function HydrationSafeApp() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Small delay to ensure all client-side code is ready
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Always show loading screen during hydration
  if (!isHydrated) {
    return <LoadingScreen />;
  }

  return (
    <NoSSR fallback={<LoadingScreen />}>
      <div className="h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
        <MainAppClient />
      </div>
    </NoSSR>
  );
}

export default function Home() {
  return (
    <ConvexClientProvider>
      <ThemeProvider>
        <ProjectProvider>
          <HydrationSafeApp />
        </ProjectProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
