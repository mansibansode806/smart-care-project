import { useState } from "react";
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

const mockAppointments = [
  { id: 1, patient: "John Doe", doctor: "Dr. Sarah Chen", date: "2026-03-15", time: "10:00 AM", status: "pending" },
  { id: 2, patient: "Jane Smith", doctor: "Dr. James Wilson", date: "2026-03-15", time: "11:00 AM", status: "pending" },
  { id: 3, patient: "Bob Johnson", doctor: "Dr. Priya Sharma", date: "2026-03-16", time: "2:00 PM", status: "accepted" },
  { id: 4, patient: "Alice Brown", doctor: "Dr. Robert Lee", date: "2026-03-16", time: "3:00 PM", status: "pending" },
];

type AdminTab = "overview" | "beds" | "doctors" | "appointments" | "analytics";

const AdminDashboard = () => {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [beds, setBeds] = useState({ total: 250, available: 70, icu: 25, emergency: 12 });
  const [appointments, setAppointments] = useState(mockAppointments);

  const tabs: { key: AdminTab; label: string; icon: typeof Bed }[] = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "beds", label: "Bed Status", icon: Bed },
    { key: "doctors", label: "Doctors", icon: Stethoscope },
    { key: "appointments", label: "Appointments", icon: Calendar },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleAppointment = (id: number, action: "accepted" | "rejected") => {
    setAppointments((a) => a.map((ap) => (ap.id === id ? { ...ap, status: action } : ap)));
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

        {tab === "doctors" && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold">Doctor Management</h2>
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> Add Doctor</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted">
                  <th className="p-3 text-left font-display font-semibold">Name</th>
                  <th className="p-3 text-left font-display font-semibold">Specialization</th>
                  <th className="p-3 text-left font-display font-semibold">Availability</th>
                </tr></thead>
                <tbody>
                  {[
                    { name: "Dr. Sarah Chen", spec: "Cardiologist", avail: "Mon-Fri, 9AM-5PM" },
                    { name: "Dr. James Wilson", spec: "Neurologist", avail: "Mon-Sat, 10AM-4PM" },
                    { name: "Dr. Priya Sharma", spec: "Orthopedic", avail: "Tue-Sat, 8AM-2PM" },
                    { name: "Dr. Robert Lee", spec: "Cardiologist", avail: "Mon-Sat, 8AM-1PM" },
                  ].map((d) => (
                    <tr key={d.name} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{d.name}</td>
                      <td className="p-3 text-muted-foreground">{d.spec}</td>
                      <td className="p-3 text-muted-foreground">{d.avail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "appointments" && (
          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{a.patient}</p>
                  <p className="text-sm text-muted-foreground">{a.doctor} · {a.date} · {a.time}</p>
                </div>
                {a.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="gap-1" onClick={() => handleAppointment(a.id, "accepted")}><Check className="h-4 w-4" /> Accept</Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleAppointment(a.id, "rejected")}><X className="h-4 w-4" /> Reject</Button>
                  </div>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${a.status === "accepted" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
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
