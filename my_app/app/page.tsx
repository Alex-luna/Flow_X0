import MainAppClient from "./MainAppClient";
import { ThemeProvider } from "../contexts/ThemeContext";

export default function Home() {
  return (
    <ThemeProvider>
      <div className="h-screen w-full bg-white dark:bg-gray-900 overflow-hidden">
        <MainAppClient />
      </div>
    </ThemeProvider>
  );
}
