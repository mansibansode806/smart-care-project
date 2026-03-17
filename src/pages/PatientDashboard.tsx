import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, Search, Calendar, Bed, Stethoscope, Clock, MapPin, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatbotWidget } from "@/components/ChatbotWidget";

const doctors = [
  { id: 1, name: "Dr. Sarah Chen", specialization: "Cardiologist", qualification: "MD, FACC", experience: "15 years", hospital: "City Heart Hospital", available: "Mon-Fri, 9AM-5PM", timeSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
  { id: 2, name: "Dr. James Wilson", specialization: "Neurologist", qualification: "MD, PhD", experience: "12 years", hospital: "City Heart Hospital", available: "Mon-Sat, 10AM-4PM", timeSlots: ["10:00 AM", "12:00 PM", "3:00 PM"] },
  { id: 3, name: "Dr. Priya Sharma", specialization: "Orthopedic", qualification: "MS Ortho", experience: "10 years", hospital: "National Medical Center", available: "Tue-Sat, 8AM-2PM", timeSlots: ["8:00 AM", "10:00 AM", "1:00 PM"] },
  { id: 4, name: "Dr. Michael Brown", specialization: "Pediatrician", qualification: "MD Pediatrics", experience: "8 years", hospital: "Children's Care Hospital", available: "Mon-Fri, 11AM-6PM", timeSlots: ["11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"] },
  { id: 5, name: "Dr. Anita Patel", specialization: "Dermatologist", qualification: "MD Dermatology", experience: "9 years", hospital: "Metro General Hospital", available: "Mon-Thu, 9AM-3PM", timeSlots: ["9:00 AM", "11:00 AM", "2:00 PM"] },
  { id: 6, name: "Dr. Robert Lee", specialization: "Cardiologist", qualification: "MD, DM Cardio", experience: "20 years", hospital: "Apollo Heart Center", available: "Mon-Sat, 8AM-1PM", timeSlots: ["8:00 AM", "9:30 AM", "11:00 AM", "12:30 PM"] },
  { id: 7, name: "Dr. Emily Davis", specialization: "Neurologist", qualification: "MD Neurology", experience: "7 years", hospital: "Metro General Hospital", available: "Mon-Fri, 10AM-5PM", timeSlots: ["10:00 AM", "1:00 PM", "4:00 PM"] },
  { id: 8, name: "Dr. Raj Kapoor", specialization: "General Physician", qualification: "MBBS, MD", experience: "14 years", hospital: "National Medical Center", available: "Mon-Sat, 9AM-6PM", timeSlots: ["9:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] },
];

const hospitals = [
  { name: "City Heart Hospital", general: 45, icu: 8, emergency: 5 },
  { name: "Metro General Hospital", general: 120, icu: 15, emergency: 10 },
  { name: "National Medical Center", general: 200, icu: 25, emergency: 12 },
  { name: "Children's Care Hospital", general: 60, icu: 10, emergency: 6 },
  { name: "Apollo Heart Center", general: 80, icu: 12, emergency: 8 },
  { name: "Sunshine Medical", general: 0, icu: 0, emergency: 2 },
];

type Tab = "doctors" | "appointment" | "beds";

const PatientDashboard = () => {
  const [tab, setTab] = useState<Tab>("doctors");
  const [searchQuery, setSearchQuery] = useState("");
  const [specFilter, setSpecFilter] = useState("all");
  const [booked, setBooked] = useState(false);

  // Appointment form state
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const filteredDoctorsByHospital = useMemo(() => {
    if (!selectedHospital) return [];
    return doctors.filter((d) => d.hospital === selectedHospital);
  }, [selectedHospital]);

  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    const doc = doctors.find((d) => String(d.id) === selectedDoctor);
    return doc?.timeSlots || [];
  }, [selectedDoctor]);

  const handleHospitalChange = (value: string) => {
    setSelectedHospital(value);
    setSelectedDoctor("");
    setSelectedTimeSlot("");
    setLoadingDoctors(true);
    setTimeout(() => setLoadingDoctors(false), 400);
  };

  const handleDoctorChange = (value: string) => {
    setSelectedDoctor(value);
    setSelectedTimeSlot("");
    setLoadingSlots(true);
    setTimeout(() => setLoadingSlots(false), 400);
  };

  const filteredDoctors = doctors.filter((d) => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.hospital.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpec = specFilter === "all" || d.specialization === specFilter;
    return matchesSearch && matchesSpec;
  });

  const specializations = [...new Set(doctors.map((d) => d.specialization))];

  const tabs: { key: Tab; label: string; icon: typeof Search }[] = [
    { key: "doctors", label: "Search Doctor", icon: Search },
    { key: "appointment", label: "Book Appointment", icon: Calendar },
    { key: "beds", label: "Bed Availability", icon: Bed },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="font-display text-lg font-bold">Patient Dashboard</span>
          </div>
          <Link to="/emergency">
            <Button variant="destructive" size="sm" className="emergency-pulse gap-1.5">
              <Stethoscope className="h-4 w-4" /> Emergency
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tab Nav */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setBooked(false); }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Search Doctors */}
        {tab === "doctors" && (
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search doctor or hospital..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
              <Select value={specFilter} onValueChange={setSpecFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {specializations.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((d) => (
                <Card key={d.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Stethoscope className="h-5 w-5 text-primary" />
                      </div>
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">{d.specialization}</span>
                    </div>
                    <h3 className="font-display text-base font-semibold text-foreground">{d.name}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{d.qualification} · {d.experience}</p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {d.hospital}</p>
                      <p className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {d.available}</p>
                    </div>
                    <Button size="sm" className="mt-4 w-full" onClick={() => setTab("appointment")}>Book Appointment</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Book Appointment */}
        {tab === "appointment" && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display"><Calendar className="h-5 w-5 text-primary" /> Book Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {booked ? (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-success" />
                  <h3 className="font-display text-xl font-bold text-foreground">Appointment Confirmed!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">You will receive a confirmation via email.</p>
                  <Button className="mt-6" onClick={() => setBooked(false)}>Book Another</Button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setBooked(true); }} className="space-y-4">
                  <div><Label>Patient Name</Label><Input placeholder="Your full name" required /></div>
                  <div>
                    <Label>Hospital</Label>
                    <Select value={selectedHospital} onValueChange={handleHospitalChange} required>
                      <SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger>
                      <SelectContent>{hospitals.map((h) => <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Doctor</Label>
                    {loadingDoctors ? (
                      <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading doctors...
                      </div>
                    ) : (
                      <Select value={selectedDoctor} onValueChange={handleDoctorChange} disabled={!selectedHospital} required>
                        <SelectTrigger><SelectValue placeholder={selectedHospital ? "Select doctor" : "Select a hospital first"} /></SelectTrigger>
                        <SelectContent>
                          {filteredDoctorsByHospital.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-muted-foreground">No doctors available for this hospital</div>
                          ) : (
                            filteredDoctorsByHospital.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name} – {d.specialization}</SelectItem>)
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Date</Label><Input type="date" required /></div>
                    <div>
                      <Label>Time Slot</Label>
                      {loadingSlots ? (
                        <div className="flex items-center gap-2 rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading slots...
                        </div>
                      ) : (
                        <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} disabled={!selectedDoctor} required>
                          <SelectTrigger><SelectValue placeholder={selectedDoctor ? "Select time" : "Select a doctor first"} /></SelectTrigger>
                          <SelectContent>
                            {availableTimeSlots.length === 0 ? (
                              <div className="px-3 py-2 text-sm text-muted-foreground">No slots available</div>
                            ) : (
                              availableTimeSlots.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={!selectedHospital || !selectedDoctor || !selectedTimeSlot}>Confirm Appointment</Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Bed Availability */}
        {tab === "beds" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted text-left">
                  <th className="p-3 font-display font-semibold">Hospital</th>
                  <th className="p-3 font-display font-semibold text-center">General Beds</th>
                  <th className="p-3 font-display font-semibold text-center">ICU Beds</th>
                  <th className="p-3 font-display font-semibold text-center">Emergency</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((h) => (
                  <tr key={h.name} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-3 font-medium text-foreground">{h.name}</td>
                    <td className="p-3 text-center">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${h.general > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {h.general > 0 ? h.general : "Full"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${h.icu > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {h.icu > 0 ? h.icu : "Full"}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${h.emergency > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                        {h.emergency > 0 ? h.emergency : "Full"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default PatientDashboard;
