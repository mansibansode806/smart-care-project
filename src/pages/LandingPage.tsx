import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Search,
  Bed,
  Calendar,
  AlertTriangle,
  Brain,
  Clock,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { LoginModal } from "@/components/LoginModal";
import { SignupModal } from "@/components/SignupModal";

const features = [
  {
    icon: Search,
    title: "Doctor Search",
    desc: "Find doctors by specialization and availability.",
  },
  {
    icon: Bed,
    title: "Hospital Bed Availability",
    desc: "View hospital-reported general, ICU, and emergency bed status.",
  },
  {
    icon: Calendar,
    title: "Online Appointments",
    desc: "Book appointments with available doctors.",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Finder",
    desc: "Find nearby hospitals with reported ICU availability.",
  },
  {
    icon: Clock,
    title: "Queue & Waiting Time",
    desc: "View the current queue and AI-estimated waiting time.",
  },
  {
    icon: Brain,
    title: "AI Predictions",
    desc: "Use AI models to estimate waiting time and future bed demand.",
  },
  {
    icon: Heart,
    title: "Health Assistant",
    desc: "Get general health guidance and healthcare navigation support.",
  },
];

const capabilities = [
  {
    title: "Patient Access",
    desc: "Search doctors, check hospital information, and book appointments.",
  },
  {
    title: "Hospital Management",
    desc: "Hospitals can update bed availability, queues, doctors, and appointments.",
  },
  {
    title: "AI Decision Support",
    desc: "AI-based predictions help provide additional information for healthcare decisions.",
  },
  {
    title: "Emergency Support",
    desc: "Find nearby hospitals based on available emergency resources.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const [user, setUser] = useState<{
    name: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("smartcare_session");

    if (session) {
      try {
        setUser(JSON.parse(session));
      } catch (error) {
        console.error("Invalid patient session:", error);
        localStorage.removeItem("smartcare_session");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("smartcare_session");
    setUser(null);
  };

  const handleLoginSuccess = (u: {
    name: string;
    email: string;
  }) => {
    setUser(u);
    navigate("/patient");
  };

  return (
    <div className="min-h-screen bg-background">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">

          <Link to="/" className="flex items-center gap-2">
            <Heart
              className="h-7 w-7 text-primary"
              fill="currentColor"
            />
            <span className="font-display text-xl font-bold text-foreground">
              SmartCare
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">

            <Link
              to="/patient"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Doctors
            </Link>

            <Link
              to="/patient"
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Patient Portal
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (user) {
                  alert(
                    "Please logout from patient account to access Hospital Panel."
                  );
                } else {
                  navigate("/hospital-login");
                }
              }}
            >
              Hospital
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (user) {
                  alert(
                    "Please logout from patient account to access Admin Panel."
                  );
                } else {
                  navigate("/admin-login");
                }
              }}
            >
              Admin
            </Button>
          </div>

          <div className="flex items-center gap-3">

            {user ? (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/patient">Dashboard</Link>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLoginOpen(true)}
                >
                  Login
                </Button>

                <Button
                  size="sm"
                  onClick={() => setSignupOpen(true)}
                >
                  Sign Up
                </Button>
              </>
            )}

          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-20 md:py-32">

        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />

        <div className="container relative mx-auto px-4 text-center">

          <div className="mx-auto max-w-3xl">

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary" />
              AI-Powered Healthcare Access
            </div>

            <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
              SmartCare – Smart Hospital Access Platform
            </h1>

            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Find hospitals, check reported resource availability,
              manage appointments, and make informed healthcare decisions.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">

              <Button
                size="lg"
                className="gap-2 px-8"
                asChild
              >
                <Link
                  to="/patient"
                  state={{ tab: "appointment" }}
                >
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Link>
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 px-8"
                asChild
              >
                <Link
                  to="/patient"
                  state={{ tab: "beds" }}
                >
                  <Bed className="h-5 w-5" />
                  Check Bed Availability
                </Link>
              </Button>

              <Button
                size="lg"
                variant="destructive"
                className="gap-2 px-8 emergency-pulse"
                asChild
              >
                <Link to="/emergency">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Finder
                </Link>
              </Button>

            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">

        <div className="container mx-auto px-4">

          <div className="mb-12 text-center">

            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              SmartCare Features
            </h2>

            <p className="text-muted-foreground">
              A healthcare platform connecting patients, hospitals, and AI-based decision support.
            </p>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <Card
                  key={feature.title}
                  className="border bg-card transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex flex-col items-start gap-3 p-6">

                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>

                    <h3 className="font-display text-lg font-semibold text-foreground">
                      {feature.title}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {feature.desc}
                    </p>

                  </CardContent>
                </Card>
              );
            })}

          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-y bg-secondary py-16">

        <div className="container mx-auto px-4">

          <div className="mb-10 text-center">

            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">
              What SmartCare Provides
            </h2>

            <p className="text-muted-foreground">
              Designed as a project prototype for smarter healthcare access and resource management.
            </p>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {capabilities.map((capability) => (
              <div
                key={capability.title}
                className="rounded-xl bg-card p-6 text-center shadow-sm"
              >

                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
                  {capability.title}
                </h3>

                <p className="text-sm text-muted-foreground">
                  {capability.desc}
                </p>

              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">

        <div className="container mx-auto px-4">

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">

            {/* About */}
            <div>

              <div className="mb-3 flex items-center gap-2">

                <Heart
                  className="h-6 w-6 text-primary"
                  fill="currentColor"
                />

                <span className="font-display text-lg font-bold">
                  SmartCare
                </span>

              </div>

              <p className="text-sm text-muted-foreground">
                An AI-powered healthcare access and resource management
                project designed to connect patients and hospitals.
              </p>

            </div>

            {/* Quick Links */}
            <div>

              <h4 className="mb-3 font-display font-semibold text-foreground">
                Quick Links
              </h4>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">

                <Link
                  to="/patient"
                  className="hover:text-foreground"
                >
                  Patient Dashboard
                </Link>

                <Link
                  to="/admin"
                  className="hover:text-foreground"
                >
                  Admin Portal
                </Link>

                <Link
                  to="/emergency"
                  className="hover:text-foreground"
                >
                  Emergency Finder
                </Link>

                <Link
                  to="/ai-prediction"
                  className="hover:text-foreground"
                >
                  AI Predictions
                </Link>

              </div>
            </div>

            {/* Project Information */}
            <div>

              <h4 className="mb-3 font-display font-semibold text-foreground">
                Project Information
              </h4>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">

                <span>
                  AI-powered healthcare decision support
                </span>

                <span>
                  Hospital resource management
                </span>

                <span>
                  Appointment and queue management
                </span>

                <span>
                  Emergency hospital discovery
                </span>

              </div>

            </div>

          </div>

          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            © 2026 SmartCare. Academic Project Prototype.
          </div>

        </div>
      </footer>

      {/* Login / Signup / Chatbot */}
      <LoginModal
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onSwitchToSignup={() => setSignupOpen(true)}
        onLoginSuccess={handleLoginSuccess}
      />

      <SignupModal
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />

      <ChatbotWidget />

    </div>
  );
};

export default LandingPage;