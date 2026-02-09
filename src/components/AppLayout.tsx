import AppNav from "@/components/AppNav";
import type { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default AppLayout;
