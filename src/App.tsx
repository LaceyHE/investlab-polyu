import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { GamificationProvider } from "@/contexts/GamificationContext";
import { XPToastContainer } from "@/components/gamification/XPToast";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import LearningPath from "./pages/LearningPath";
import CausalLab from "./pages/CausalLab";
import FinSignal from "./pages/FinSignal";
import Foundations from "./pages/Foundations";
import RequireModule from "@/components/RequireModule";
import ModuleOne from "./pages/ModuleOne";
import ModuleTwo from "./pages/ModuleTwo";
import ModuleThree from "./pages/ModuleThree";
import ModuleFour from "./pages/ModuleFour";
import ModuleFive from "./pages/ModuleFive";
import ModuleSix from "./pages/ModuleSix";
import Sandbox from "./pages/Sandbox";
import ScenarioSimulator from "./pages/ScenarioSimulator";
import Account from "./pages/Account";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FinancialStatements from "./pages/FinancialStatements";
import CaseDetail from "./pages/CaseDetail";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <GamificationProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <XPToastContainer />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/knowledge-hub" element={<Navigate to="/" replace />} />
              <Route path="/finsignal" element={<FinSignal />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/causal-lab" element={<CausalLab />} />
              <Route path="/causal-lab/case/:caseId" element={<CaseDetail />} />
              <Route path="/foundations" element={<Foundations />} />
              <Route path="/module/1" element={<ModuleOne />} />
              <Route path="/module/2" element={<RequireModule prev="module-1"><ModuleTwo /></RequireModule>} />
              <Route path="/module/3" element={<RequireModule prev="module-2"><ModuleThree /></RequireModule>} />
              <Route path="/module/4" element={<RequireModule prev="module-3"><ModuleFour /></RequireModule>} />
              <Route path="/module/5" element={<RequireModule prev="module-4"><ModuleFive /></RequireModule>} />
              <Route path="/module/6" element={<RequireModule prev="module-5"><ModuleSix /></RequireModule>} />
              <Route path="/sandbox" element={<Sandbox />} />
              <Route path="/scenarios" element={<ScenarioSimulator />} />
              <Route path="/account" element={<Account />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/stress-tests" element={<Navigate to="/scenarios" replace />} />
              <Route path="/financial-statements" element={<FinancialStatements />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </GamificationProvider>
  </AuthProvider>
);

export default App;