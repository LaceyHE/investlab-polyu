import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useGamification } from "@/contexts/GamificationContext";

interface RequireModuleProps {
  /** Module id that must be completed before this route opens, e.g. "module-1". */
  prev: string;
  children: ReactNode;
}

/**
 * Route guard enforcing sequential progress through the Learning Path.
 * If the prerequisite module isn't completed yet, bounce back to the path.
 */
const RequireModule = ({ prev, children }: RequireModuleProps) => {
  const { state } = useGamification();
  const completed = state.completedModuleIds ?? [];

  if (!completed.includes(prev)) {
    return <Navigate to="/learning-path" replace />;
  }
  return <>{children}</>;
};

export default RequireModule;
