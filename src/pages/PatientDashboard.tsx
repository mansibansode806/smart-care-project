
// export default PatientDashboard;
import { useState, useMemo,useEffect } from "react";
import { Link, useLocation} from "react-router-dom";
import { Heart, Search, Calendar, Bed, Stethoscope, Clock, MapPin, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatbotWidget } from "@/components/ChatbotWidget";



type Tab = "doctors" | "appointment" | "beds";

const PatientDashboard = () => {
  const location = useLocation();
const initialTab = (location.state as any)?.tab || "doctors";
const [tab, setTab] = useState<Tab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [specFilter, setSpecFilter] = useState("all");
  const [booked, setBooked] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
const [hospitals, setHospitals] = useState<any[]>([]);

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: "doctors", label: "Search Doctor", icon: Search },
  { key: "appointment", label: "Book Appointment", icon: Calendar },
  { key: "beds", label: "Bed Availability", icon: Bed },
];
useEffect(() => {
  if ((location.state as any)?.tab) {
    setTab((location.state as any).tab);
  }
}, [location.state]);
  // Validation states
  const [patientName, setPatientName] = useState("");
  const [nameError, setNameError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  // Appointment form state
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

 

useEffect(() => {
  fetchDoctors();
  fetchHospitals();
}, []);


const fetchDoctors = async () => {
  const res = await fetch("http://localhost:3001/doctors");
  const data = await res.json();
  setDoctors(data);
};

const fetchHospitals = async () => {
  const res = await fetch("http://localhost:3001/hospitals");
  const data = await res.json();
  setHospitals(data);
};

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const regex = /^[A-Za-z\s]*$/;

    if (regex.test(value)) {
      setPatientName(value);
      setNameError("");
    } else {
      setNameError("Name should contain only letters");
    }
  };

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

  

  const handleBookAppointment = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await fetch("http://localhost:3001/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        patientName: patientName,
        hospital: selectedHospital,
        doctorId: selectedDoctor,
        timeSlot: selectedTimeSlot,
        date: (document.querySelector('input[type="date"]') as HTMLInputElement)?.value,
        status: "pending"
      })
    });

    setBooked(true);
  } catch (error) {
    console.log("Error booking appointment");
  }
};

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
            // const Icon = t.icon;
            
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

        {/* Appointment Tab */}
        {tab === "appointment" && (
          <Card className="mx-auto max-w-lg">
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              {booked ? (
                <div className="py-8 text-center">
                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />
                  <h3 className="text-xl font-bold">Appointment Confirmed!</h3>
                  <Button className="mt-6" onClick={() => setBooked(false)}>Book Another</Button>
                </div>
              ) : (
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  {/* Patient Name */}
                  <div>
                    <Label>Patient Name</Label>
                    <Input
                      placeholder="Your full name"
                      value={patientName}
                      onChange={handleNameChange}
                      required
                    />
                    {nameError && (
                      <p className="text-red-500 text-sm">{nameError}</p>
                    )}
                  </div>

                  {/* Hospital */}
                  <div>
                    <Label>Hospital</Label>
                    <Select value={selectedHospital} onValueChange={handleHospitalChange}>
                      <SelectTrigger><SelectValue placeholder="Select hospital" /></SelectTrigger>
                      <SelectContent>
                        {hospitals.map((h) => (
                          <SelectItem key={h.name} value={h.name}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Doctor */}
                  <div>
                    <Label>Doctor</Label>
                    {loadingDoctors ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="animate-spin h-4 w-4" /> Loading doctors...
                      </div>
                    ) : (
                      <Select value={selectedDoctor} onValueChange={handleDoctorChange} disabled={!selectedHospital}>
                        <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                        <SelectContent>
                          {filteredDoctorsByHospital.map((d) => (
                            <SelectItem key={d.id} value={String(d.id)}>
                              {d.name} – {d.specialization}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Date + Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input type="date" min={today} required />
                    </div>

                    <div>
                      <Label>Time Slot</Label>
                      <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} disabled={!selectedDoctor}>
                        <SelectTrigger><SelectValue placeholder="Select time" /></SelectTrigger>
                        <SelectContent>
                          {availableTimeSlots.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !patientName ||
                      nameError !== "" ||
                      !selectedHospital ||
                      !selectedDoctor ||
                      !selectedTimeSlot
                      }
                  >
                    Confirm Appointment
                  </Button>

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