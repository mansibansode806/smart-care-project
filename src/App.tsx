import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import PatientDashboard from "./pages/PatientDashboard";
import EmergencyPage from "./pages/EmergencyPage";
import AdminDashboard from "./pages/AdminDashboard";
import AIPrediction from "./pages/AIPrediction";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient" element={<PatientDashboard />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/ai-prediction" element={<AIPrediction />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
