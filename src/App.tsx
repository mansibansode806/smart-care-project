import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes ,Navigate} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import QueuePage from "./pages/QueuePage";
import PatientDashboard from "./pages/PatientDashboard";
import EmergencyPage from "./pages/EmergencyPage";
import AdminDashboard from "./pages/AdminDashboard";
import AIPrediction from "./pages/AIPrediction";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";

const queryClient = new QueryClient();
// Protected Route
const AdminRoute = ({ children }: any) => {
  const isAdmin = localStorage.getItem("adminLoggedIn");
  const isUser = localStorage.getItem("smartcare_session");

  if (isUser) {
    return <Navigate to="/" />;
  }
  return isAdmin ? children : <Navigate to="/admin-login" />;
};
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
          {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          <Route path="/queue" element={<QueuePage />} />
          {/* <Route path="/ai-prediction" element={<AIPrediction />} /> */}
          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Protected Admin Dashboard */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
