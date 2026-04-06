import AppNav from "@/components/AppNav";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <AppNav />
      <main className="flex-1 min-h-0 pt-16">{children}</main>
    </div>
  );
};

export default AppLayout;
