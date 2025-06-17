import MainAppClient from "./MainAppClient";
import { ThemeProvider } from "../contexts/ThemeContext";
import { ConvexClientProvider } from "../contexts/ConvexProvider";
import { ProjectProvider } from "../contexts/ProjectContext";

export default function Home() {
  return (
    <ConvexClientProvider>
      <ThemeProvider>
        <ProjectProvider>
          <div className="h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
            <MainAppClient />
          </div>
        </ProjectProvider>
      </ThemeProvider>
    </ConvexClientProvider>
  );
}
