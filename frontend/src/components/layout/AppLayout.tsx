import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={true} />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 lg:ml-64 px-3 py-4 md:px-6 md:py-6 pb-20 lg:pb-6 min-w-0 overflow-x-hidden">
          <div className="max-w-4xl mx-auto">{children}</div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
