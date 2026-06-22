import AppNav from "@/components/AppNav";
import ChatBot from "@/components/ChatBot";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNav />
      <main className="pt-16 flex-1">{children}</main>
      <footer className="border-t border-border/40 bg-background py-3 text-center px-4">
        <p className="text-[10px] text-muted-foreground/50 tracking-wide">
          Disclaimer — InvestLab is for educational purposes only.{" "}
          <span className="font-medium">No financial advice. No projections. Just understanding.</span>
        </p>
      </footer>
      <ChatBot />
    </div>
  );
};

export default AppLayout;
