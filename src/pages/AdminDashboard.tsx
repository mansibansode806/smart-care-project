import { useState ,useEffect} from "react";
import { Link } from "react-router-dom";
import { Heart, Bed, Users, Stethoscope, Calendar, BarChart3, ArrowLeft, Plus, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const occupancyData = [
  { day: "Mon", occupied: 180, total: 250 },
  { day: "Tue", occupied: 195, total: 250 },
  { day: "Wed", occupied: 210, total: 250 },
  { day: "Thu", occupied: 200, total: 250 },
  { day: "Fri", occupied: 225, total: 250 },
  { day: "Sat", occupied: 190, total: 250 },
  { day: "Sun", occupied: 170, total: 250 },
];

const appointmentData = [
  { day: "Mon", count: 32 }, { day: "Tue", count: 45 }, { day: "Wed", count: 38 },
  { day: "Thu", count: 52 }, { day: "Fri", count: 48 }, { day: "Sat", count: 28 }, { day: "Sun", count: 15 },
];



type AdminTab = "overview" | "beds" | "doctors" | "appointments" | "analytics";

const AdminDashboard = () => {
  
  const [tab, setTab] = useState<AdminTab>("overview");
  const [beds, setBeds] = useState({ total: 250, available: 70, icu: 25, emergency: 12 });
  const [appointments, setAppointments] = useState<any[]>([]);
  const [showDoctorForm, setShowDoctorForm] = useState(false);
const [doctorName, setDoctorName] = useState("");
const [specialization, setSpecialization] = useState("");
const [availability, setAvailability] = useState("");
const [qualification, setQualification] = useState("");
const [experience, setExperience] = useState("");
const [hospital, setHospital] = useState("");
const [timeSlots, setTimeSlots] = useState("");

 // Doctor States
  const [doctors, setDoctors] = useState<any[]>([]);
  
  const tabs: { key: AdminTab; label: string; icon: typeof Bed }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "beds", label: "Bed Status", icon: Bed },
    { key: "doctors", label: "Doctors", icon: Stethoscope },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleAppointmentStatus = async (id: number, status: string) => {
  const appointment = appointments.find((a) => a.id === id);

  await fetch(`http://localhost:3001/appointments/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      ...appointment,
      status: status
    })
  });

  fetchAppointments();
};
  
  const fetchAppointments = async () => {
  const res = await fetch("http://localhost:3001/appointments");
  const data = await res.json();
  setAppointments(data);
};
  // Load doctors from JSON server
  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    const res = await fetch("http://localhost:3001/doctors");
    const data = await res.json();
    setDoctors(data);
  };

  const handleAddDoctor = async () => {
  await fetch("http://localhost:3001/doctors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: doctorName,
      specialization: specialization,
      qualification: qualification,
      experience: experience,
      hospital: hospital,
      available: availability,
      timeSlots: timeSlots.split(",")
    })
  });

  setDoctorName("");
  setSpecialization("");
  setQualification("");
  setExperience("");
  setHospital("");
  setAvailability("");
  setTimeSlots("");
  setShowDoctorForm(false);

  fetchDoctors();
};
const handleDeleteDoctor = async (id: number) => {
  try {
    await fetch(`http://localhost:3001/doctors/${id}`, {
      method: "DELETE"
    });

    // reload doctors after delete
    fetchDoctors();
  } catch (error) {
    console.log("Error deleting doctor");
  }
};
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <Heart className="h-6 w-6 text-primary" fill="currentColor" />
          <span className="font-display text-lg font-bold">Admin Dashboard</span>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${tab === t.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Beds", value: beds.total, icon: Bed, color: "text-primary" },
              { label: "Available Beds", value: beds.available, icon: Bed, color: "text-success" },
              { label: "ICU Beds", value: beds.icu, icon: Bed, color: "text-primary" },
              { label: "Emergency Beds", value: beds.emergency, icon: Bed, color: "text-destructive" },
            ].map((s) => (
              <Card key={s.label}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="font-display text-2xl font-bold text-foreground">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {tab === "beds" && (
          <Card className="mx-auto max-w-md">
            <CardHeader><CardTitle className="font-display">Update Bed Status</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Total Beds", key: "total" as const },
                { label: "Available Beds", key: "available" as const },
                { label: "ICU Beds", key: "icu" as const },
                { label: "Emergency Beds", key: "emergency" as const },
              ].map((f) => (
                <div key={f.key}>
                  <Label>{f.label}</Label>
                  <Input type="number" value={beds[f.key]} onChange={(e) => setBeds({ ...beds, [f.key]: Number(e.target.value) })} />
                </div>
              ))}
              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>
        )}

        {/* Doctors */}
        {tab === "doctors" && (
          <div>
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">Doctor Management</h2>
              <Button onClick={() => setShowDoctorForm(true)}>
                <Plus className="h-4 w-4" /> Add Doctor
              </Button>
            </div>

            {showDoctorForm && (
              <Card className="mb-4 max-w-md">
                <CardHeader><CardTitle>Add Doctor</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Input placeholder="Doctor Name" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} />
                  <Input placeholder="Specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                  <Input placeholder="Qualification" value={qualification} onChange={(e) => setQualification(e.target.value)} />
                  <Input placeholder="Experience (e.g., 10 years)" value={experience} onChange={(e) => setExperience(e.target.value)} />
                  <Input placeholder="Hospital Name" value={hospital} onChange={(e) => setHospital(e.target.value)} />
                  <Input placeholder="Available (e.g., Mon-Fri, 9AM-5PM)" value={availability} onChange={(e) => setAvailability(e.target.value)} />
                  <Input placeholder="Time Slots (comma separated)" value={timeSlots} onChange={(e) => setTimeSlots(e.target.value)} />
                  <Button onClick={handleAddDoctor} className="w-full">Save Doctor</Button>
                </CardContent>
              </Card>
            )}

            <table className="w-full border">
              <thead>
                <tr className="bg-muted">
                  <th className="p-2">Name</th>
                  <th className="p-2">Specialization</th>
                  {/* <th className="p-2">Availability</th> */}
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((d) => (
                  <tr key={d.id} className="border text-center">
                    <td className="p-2">{d.name}</td>
                    <td className="p-2">{d.specialization}</td>
                    {/* <td className="p-2">{d.availability}</td> */}
                    <td className="p-2">
                      <Button variant="destructive" onClick={() => handleDeleteDoctor(d.id)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "appointments" && (
  <div className="space-y-3">
    {appointments.map((a) => (
      <div key={a.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-medium text-foreground">{a.patientName}</p>
          <p className="text-sm text-muted-foreground">
            {a.hospital} · {a.date} · {a.timeSlot}
          </p>
        </div>

        {/* Action Buttons */}
        {a.status === "pending" && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleAppointmentStatus(a.id, "accepted")}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAppointmentStatus(a.id, "rejected")}
            >
              Reject
            </Button>
          </div>
        )}

        {a.status === "accepted" && (
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
              Accepted
            </span>
            <Button
              size="sm"
              onClick={() => handleAppointmentStatus(a.id, "completed")}
            >
              Completed
            </Button>
          </div>
        )}

        {a.status === "completed" && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
            Completed
          </span>
        )}

        {a.status === "rejected" && (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded">
            Rejected
          </span>
        )}
      </div>
    ))}
  </div>
)}

        {tab === "analytics" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Bed Occupancy (This Week)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="occupied" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="font-display text-base">Appointments (This Week)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={appointmentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <ChatbotWidget />
    </div>
  );
};

export default AdminDashboard;
