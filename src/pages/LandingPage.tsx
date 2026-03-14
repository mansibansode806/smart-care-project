import { Link } from "react-router-dom";
import { Heart, Search, Bed, Calendar, AlertTriangle, Brain, Hospital, Users, Stethoscope, Phone, Mail, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const features = [
  { icon: Search, title: "Doctor Search", desc: "Find doctors by specialization and availability" },
  { icon: Bed, title: "ICU & Bed Availability", desc: "Real-time bed and ICU status across hospitals" },
  { icon: Calendar, title: "Online Appointments", desc: "Book appointments with doctors instantly" },
  { icon: AlertTriangle, title: "Emergency Finder", desc: "Locate nearest hospitals with ICU availability" },
  { icon: Clock, title: "Live Queue Tracking", desc: "Check patient wait times and get turn reminders" },
  { icon: Brain, title: "AI Bed Prediction", desc: "Forecast bed demand using AI analytics" },
  { icon: Heart, title: "Health Assistant", desc: "AI chatbot for health guidance and navigation" },
];

const stats = [
  { value: "120+", label: "Hospitals Connected", icon: Hospital },
  { value: "8,500", label: "Beds Available", icon: Bed },
  { value: "2,400+", label: "Doctors Available", icon: Stethoscope },
  { value: "50K+", label: "Patients Served", icon: Users },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary" fill="currentColor" />
            <span className="font-display text-xl font-bold text-foreground">SmartCare</span>
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link to="/emergency" className="text-sm font-medium text-muted-foreground hover:text-foreground">Emergency</Link>
            <Link to="/queue" className="text-sm font-medium text-muted-foreground hover:text-foreground">Queue</Link>
            <Link to="/patient" className="text-sm font-medium text-muted-foreground hover:text-foreground">Patient Portal</Link>
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground">Admin</Link>
            <Link to="/ai-prediction" className="text-sm font-medium text-muted-foreground hover:text-foreground">AI Predictions</Link>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link to="/patient">Login</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/patient">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="container relative mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary" /> Trusted by 120+ Hospitals
            </div>
            <h1 className="mb-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
              SmartCare – Smart Hospital Access Platform
            </h1>
            <p className="mb-10 text-lg text-muted-foreground md:text-xl">
              Find hospitals, check bed availability, and book appointments instantly. Your health, our priority.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2 px-8" asChild>
                <Link to="/patient"><Calendar className="h-5 w-5" /> Book Appointment</Link>
              </Button>
              <Button size="lg" variant="outline" className="gap-2 px-8" asChild>
                <Link to="/patient"><Bed className="h-5 w-5" /> Check Bed Availability</Link>
              </Button>
              <Button size="lg" variant="destructive" className="gap-2 px-8 emergency-pulse" asChild>
                <Link to="/emergency"><AlertTriangle className="h-5 w-5" /> Emergency Mode</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-muted-foreground">Comprehensive healthcare services at your fingertips</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border bg-card transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col items-start gap-3 p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <s.icon className="mx-auto mb-3 h-8 w-8 text-primary" />
                <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary" fill="currentColor" />
                <span className="font-display text-lg font-bold">SmartCare</span>
              </div>
              <p className="text-sm text-muted-foreground">Smart Hospital Access Platform for modern healthcare needs.</p>
            </div>
            <div>
              <h4 className="mb-3 font-display font-semibold text-foreground">Quick Links</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link to="/patient" className="hover:text-foreground">Patient Dashboard</Link>
                <Link to="/admin" className="hover:text-foreground">Admin Portal</Link>
                <Link to="/emergency" className="hover:text-foreground">Emergency Mode</Link>
                <Link to="/ai-prediction" className="hover:text-foreground">AI Predictions</Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-display font-semibold text-foreground">Contact</h4>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1-800-SMART-CARE</span>
                <span className="flex items-center gap-2"><Mail className="h-4 w-4" /> support@smartcare.com</span>
                <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Health City, Medical District</span>
              </div>
            </div>
            <div>
              <h4 className="mb-3 font-display font-semibold text-foreground">Emergency Helpline</h4>
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="font-display text-lg font-bold text-destructive">108</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Available 24/7 for medical emergencies</p>
            </div>
          </div>
          <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
            © 2026 SmartCare. All rights reserved.
          </div>
        </div>
      </footer>

      <ChatbotWidget />
    </div>
  );
};

export default LandingPage;
