import { Link } from "react-router-dom";
import { AlertTriangle, Phone, Bed, Stethoscope, MapPin, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const emergencyHospitals = [
  { name: "Metro General Hospital", icu: 15, emergencyDoc: "Dr. A. Singh", distance: "1.2 km", contact: "+1-800-111-2222" },
  { name: "National Medical Center", icu: 25, emergencyDoc: "Dr. R. Kumar", distance: "2.5 km", contact: "+1-800-333-4444" },
  { name: "City Heart Hospital", icu: 8, emergencyDoc: "Dr. S. Chen", distance: "3.1 km", contact: "+1-800-555-6666" },
  { name: "Apollo Heart Center", icu: 12, emergencyDoc: "Dr. P. Mehta", distance: "4.0 km", contact: "+1-800-777-8888" },
  { name: "Children's Care Hospital", icu: 10, emergencyDoc: "Dr. M. Brown", distance: "5.3 km", contact: "+1-800-999-0000" },
  { name: "Sunshine Medical", icu: 0, emergencyDoc: "N/A", distance: "6.8 km", contact: "+1-800-222-3333" },
].sort((a, b) => b.icu - a.icu);

const EmergencyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Header */}
      <header className="bg-destructive px-4 py-6 text-destructive-foreground">
        <div className="container mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-destructive-foreground hover:bg-destructive-foreground/10" asChild>
              <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <Heart className="h-6 w-6" fill="currentColor" />
          </div>
          <div className="text-center">
            <AlertTriangle className="mx-auto mb-3 h-12 w-12 emergency-pulse" />
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">EMERGENCY MODE</h1>
            <p className="mt-2 text-lg opacity-90">Showing hospitals sorted by ICU availability</p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive-foreground/20 px-5 py-2 text-lg font-bold">
              <Phone className="h-5 w-5" /> Call 108
            </div>
          </div>
        </div>
      </header>

      {/* Hospital List */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-4">
          {emergencyHospitals.map((h) => (
            <div
              key={h.name}
              className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${h.icu === 0 ? "border-destructive/30 bg-destructive/5 opacity-70" : "bg-card"}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold text-foreground">{h.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {h.distance}</span>
                    <span className="flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5" /> {h.emergencyDoc}</span>
                    <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {h.contact}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">ICU Beds</span>
                    </div>
                    <span className={`font-display text-2xl font-bold ${h.icu > 0 ? "text-success" : "text-destructive"}`}>
                      {h.icu > 0 ? h.icu : "Full"}
                    </span>
                  </div>
                  <a href={`tel:${h.contact}`}>
                    <Button variant={h.icu > 0 ? "default" : "outline"} size="sm" className="gap-1.5">
                      <Phone className="h-4 w-4" /> Call Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyPage;
