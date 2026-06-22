import AppNav from "@/components/AppNav";
import ChatBot from "@/components/ChatBot";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="pt-16">{children}</main>
      <ChatBot />
    </div>
  );
};

export default AppLayout;
