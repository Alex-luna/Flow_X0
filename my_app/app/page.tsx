import MainAppClient from "./MainAppClient";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white dark:bg-black">
      <header className="w-full flex flex-col items-center pt-8 pb-2">
        <svg width="180" height="48" viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <text x="0" y="38" fontFamily="'Geist', 'Inter', Arial, sans-serif" fontWeight="bold" fontSize="48" fill="#111">
            Flow X
          </text>
        </svg>
      </header>
      <MainAppClient />
      <footer className="flex gap-[24px] flex-wrap items-center justify-center py-4">
        {/* Footer links removidos para simplificação */}
      </footer>
    </div>
  );
}
