import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import LearningPath from "./pages/LearningPath";
import ModuleOne from "./pages/ModuleOne";
import ModuleTwo from "./pages/ModuleTwo";
import ModuleThree from "./pages/ModuleThree";
import ModuleFour from "./pages/ModuleFour";
import ModuleFive from "./pages/ModuleFive";
import ModuleSix from "./pages/ModuleSix";
import Sandbox from "./pages/Sandbox";
import ScenarioSimulator from "./pages/ScenarioSimulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/module/1" element={<ModuleOne />} />
          <Route path="/module/2" element={<ModuleTwo />} />
          <Route path="/module/3" element={<ModuleThree />} />
          <Route path="/module/4" element={<ModuleFour />} />
          <Route path="/module/5" element={<ModuleFive />} />
          <Route path="/module/6" element={<ModuleSix />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="/scenarios" element={<ScenarioSimulator />} />
          <Route path="/stress-tests" element={<Navigate to="/scenarios" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
