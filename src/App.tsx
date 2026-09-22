import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

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
import HospitalDashboard from "./pages/HospitalDashboard";
import HospitalLogin from "./pages/HospitalLogin";
import HospitalRegister from "./pages/HospitalRegister";

const queryClient = new QueryClient();

// ===============================
// PROTECTED ADMIN ROUTE
// ===============================

const AdminRoute = ({ children }: any) => {
  const adminSession = localStorage.getItem("smartcare_admin_session");
  const patientSession = localStorage.getItem("smartcare_session");

  // If patient is logged in, don't allow admin panel
  if (patientSession) {
    return <Navigate to="/" replace />;
  }

  // If admin is not logged in, go to admin login
  if (!adminSession) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
};

// ===============================
// APP
// ===============================

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <BrowserRouter>
        <Routes>

          {/* ===============================
              LANDING PAGE
          =============================== */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* ===============================
              PATIENT DASHBOARD
          =============================== */}
          <Route
            path="/patient"
            element={<PatientDashboard />}
          />

          {/* ===============================
              EMERGENCY
          =============================== */}
          <Route
            path="/emergency"
            element={<EmergencyPage />}
          />

          {/* ===============================
              QUEUE
          =============================== */}
          <Route
            path="/queue"
            element={<QueuePage />}
          />

          {/* ===============================
              AI PREDICTION
          =============================== */}
          <Route
            path="/ai-prediction"
            element={<AIPrediction />}
          />

          {/* ===============================
              ADMIN LOGIN
          =============================== */}
          <Route
            path="/admin-login"
            element={<AdminLogin />}
          />

          {/* ===============================
              ADMIN DASHBOARD
              =============================== */}
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Keep /admin working too */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* ===============================
              HOSPITAL LOGIN
          =============================== */}
          <Route
            path="/hospital-login"
            element={<HospitalLogin />}
          />

          {/* ===============================
              HOSPITAL REGISTRATION
          =============================== */}
          <Route
            path="/hospital-register"
            element={<HospitalRegister />}
          />

          {/* ===============================
              HOSPITAL DASHBOARD
          =============================== */}
          <Route
            path="/hospital-dashboard"
            element={<HospitalDashboard />}
          />

          {/* ===============================
              404
          =============================== */}
          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;