import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Heart,
  Search,
  Calendar,
  Bed,
  Stethoscope,
  Clock,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ChatbotWidget } from "@/components/ChatbotWidget";

type Tab = "doctors" | "appointment" | "beds";

const API_URL = "http://localhost:5001/api";

const PatientDashboard = () => {
  const location = useLocation();

  const initialTab = (location.state as any)?.tab || "doctors";

  const [tab, setTab] = useState<Tab>(initialTab);

  const [searchQuery, setSearchQuery] = useState("");
  const [specFilter, setSpecFilter] = useState("all");

  const [booked, setBooked] = useState(false);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [waitingTimes, setWaitingTimes] = useState<Record<number, number>>({});

  const [patientName, setPatientName] = useState("");
  const [nameError, setNameError] = useState("");

  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [selectedDate, setSelectedDate] = useState("");

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [loadingData, setLoadingData] = useState(true);

  const [appointmentError, setAppointmentError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const tabs: { key: Tab; label: string; icon: any }[] = [
    {
      key: "doctors",
      label: "Search Doctor",
      icon: Search,
    },
    {
      key: "appointment",
      label: "Book Appointment",
      icon: Calendar,
    },
    {
      key: "beds",
      label: "Bed Availability",
      icon: Bed,
    },
  ];

  useEffect(() => {
    if ((location.state as any)?.tab) {
      setTab((location.state as any).tab);
    }
  }, [location.state]);

  // ===============================
  // FETCH DOCTORS + HOSPITALS
  // ===============================

  useEffect(() => {
    fetchDoctors();
    fetchHospitals();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`${API_URL}/doctors`);

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();

      setDoctors(data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoadingData(false);
    }
  };


 const fetchHospitals = async () => {
  try {
    // Fetch hospital data
    const response = await fetch(`${API_URL}/hospitals`);

    if (!response.ok) {
      throw new Error("Failed to fetch hospitals");
    }

    const data = await response.json();

    // Store hospital data
    setHospitals(data);

    // Store ML predicted waiting times
    const waitingTimeData: Record<number, number> = {};

    for (const hospital of data) {
      try {
        // Get Random Forest ML prediction
        const response = await fetch(
          `${API_URL}/hospital-waiting-time/${hospital.hospital_id}`
        );

        if (response.ok) {
          const result = await response.json();

          waitingTimeData[hospital.hospital_id] =
            result.predicted_waiting_minutes;
        }
      } catch (error) {
        console.error(
          `Failed to fetch waiting time for ${hospital.name}:`,
          error
        );
      }
    }

    // Store all ML predictions
    setWaitingTimes(waitingTimeData);
  } catch (error) {
    console.error("Error fetching hospitals:", error);
  } finally {
    setLoadingData(false);
  }
};


  // ===============================
  // NAME VALIDATION
  // ===============================

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    const regex = /^[A-Za-z\s]*$/;

    if (regex.test(value)) {
      setPatientName(value);
      setNameError("");
    } else {
      setNameError("Name should contain only letters");
    }
  };

  // ===============================
  // FILTER DOCTORS BY HOSPITAL
  // ===============================

  const filteredDoctorsByHospital = useMemo(() => {
    if (!selectedHospital) {
      return [];
    }

    return doctors.filter(
      (doctor) => doctor.hospital === selectedHospital
    );
  }, [selectedHospital, doctors]);

  // ===============================
  // TIME SLOTS
  // ===============================

  const availableTimeSlots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) {
      return [];
    }
  
    const doctor = doctors.find(
      (d) => String(d.id) === selectedDoctor
    );
  
    if (!doctor?.schedules?.length) {
      return [];
    }
  
    // Get the day name for the selected date
    const date = new Date(`${selectedDate}T00:00:00`);
  
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
  
    const selectedDay = days[date.getDay()];
  
    // Find doctor's schedule for that day
    const schedule = doctor.schedules.find(
      (s: any) => s.day_of_week === selectedDay
    );
  
    if (!schedule) {
      return [];
    }
  
    // Generate 30-minute appointment slots
    const slots: string[] = [];
  
    const start = new Date(`2000-01-01T${schedule.start_time}`);
    const end = new Date(`2000-01-01T${schedule.end_time}`);
  
    while (start < end) {
      slots.push(
        start.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
  
      start.setMinutes(start.getMinutes() + (schedule.slot_duration || 30));
    }
  
    return slots;
  }, [selectedDoctor, selectedDate, doctors]);

  // ===============================
  // HOSPITAL CHANGE
  // ===============================

  const handleHospitalChange = (value: string) => {
    setSelectedHospital(value);

    setSelectedDoctor("");
    setSelectedTimeSlot("");

    setLoadingDoctors(true);

    setTimeout(() => {
      setLoadingDoctors(false);
    }, 400);
  };

  // ===============================
  // DOCTOR CHANGE
  // ===============================

  const handleDoctorChange = (value: string) => {
    setSelectedDoctor(value);

    setSelectedTimeSlot("");

    setLoadingSlots(true);

    setTimeout(() => {
      setLoadingSlots(false);
    }, 400);
  };

  // ===============================
  // SEARCH + SPECIALIZATION FILTER
  // ===============================

  const filteredDoctors = doctors.filter((doctor) => {
    const doctorName = doctor.name || "";
    const hospitalName = doctor.hospital || "";

    const matchesSearch =
      doctorName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      hospitalName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesSpec =
      specFilter === "all" ||
      doctor.specialization === specFilter;

    return matchesSearch && matchesSpec;
  });

  const specializations = [
    ...new Set(
      doctors
        .map((doctor) => doctor.specialization)
        .filter(Boolean)
    ),
  ];

  // ===============================
  // BOOK APPOINTMENT
  // ===============================

  const handleBookAppointment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setAppointmentError("");

    if (!patientName.trim()) {
      setAppointmentError("Patient name is required.");
      return;
    }

    if (!selectedHospital) {
      setAppointmentError("Please select a hospital.");
      return;
    }

    if (!selectedDoctor) {
      setAppointmentError("Please select a doctor.");
      return;
    }

    if (!selectedDate) {
      setAppointmentError("Please select an appointment date.");
      return;
    }

    if (!selectedTimeSlot) {
      setAppointmentError("Please select a time slot.");
      return;
    }

    try {
      const session = localStorage.getItem(
        "smartcare_session"
      );

      let patientEmail = "";

      if (session) {
        const user = JSON.parse(session);
        patientEmail = user.email || "";
      }

      const response = await fetch(
        `${API_URL}/appointments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patientName: patientName.trim(),
            patientEmail,
            hospital: selectedHospital,
            doctorId: selectedDoctor,
            timeSlot: selectedTimeSlot,
            date: selectedDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAppointmentError(
          data.message || "Failed to book appointment."
        );
        return;
      }

      setBooked(true);
    } catch (error) {
      console.error("Error booking appointment:", error);

      setAppointmentError(
        "Unable to connect to SmartCare server."
      );
    }
  };

  // ===============================
  // LOADING
  // ===============================

  if (loadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading SmartCare...
        </div>
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}

      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">

          <div className="flex items-center gap-3">

            <Button
              variant="ghost"
              size="icon"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <Heart
              className="h-6 w-6 text-primary"
              fill="currentColor"
            />

            <span className="font-display text-lg font-bold">
              Patient Dashboard
            </span>

          </div>

          <Link to="/emergency">
            <Button
              variant="destructive"
              size="sm"
              className="emergency-pulse gap-1.5"
            >
              <Stethoscope className="h-4 w-4" />
              Emergency
            </Button>
          </Link>

        </div>
      </header>

      <div className="container mx-auto px-4 py-6">

        {/* Tabs */}

        <div className="mb-6 flex gap-2 overflow-x-auto">

          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setBooked(false);
                setAppointmentError("");
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}

        </div>

        {/* ===============================
            SEARCH DOCTORS
        =============================== */}

        {tab === "doctors" && (
          <div>

            <div className="mb-6 flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  placeholder="Search doctor or hospital..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-9"
                />

              </div>

              <Select
                value={specFilter}
                onValueChange={setSpecFilter}
              >

                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Specialization" />
                </SelectTrigger>

                <SelectContent>

                  <SelectItem value="all">
                    All Specializations
                  </SelectItem>

                  {specializations.map((specialization) => (
                    <SelectItem
                      key={specialization}
                      value={specialization}
                    >
                      {specialization}
                    </SelectItem>
                  ))}

                </SelectContent>

              </Select>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {filteredDoctors.map((doctor) => (
                <Card
                  key={doctor.id}
                  className="transition-shadow hover:shadow-md"
                >

                  <CardContent className="p-5">

                    <div className="mb-3 flex items-start justify-between">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">

                        <Stethoscope className="h-5 w-5 text-primary" />

                      </div>

                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                        {doctor.specialization}
                      </span>

                    </div>

                    <h3 className="font-display text-base font-semibold text-foreground">
                      {doctor.name}
                    </h3>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {doctor.qualification} ·{" "}
                      {doctor.experience}
                    </p>

                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">

                      <p className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {doctor.hospital}
                      </p>

                      <p className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {doctor.available}
                      </p>

                    </div>

                    <Button
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => {
                        setSelectedHospital(
                          doctor.hospital || ""
                        );
                        setSelectedDoctor(
                          String(doctor.id)
                        );
                        setTab("appointment");
                      }}
                    >
                      Book Appointment
                    </Button>

                  </CardContent>

                </Card>
              ))}

            </div>

          </div>
        )}

        {/* ===============================
            APPOINTMENT
        =============================== */}

        {tab === "appointment" && (
          <Card className="mx-auto max-w-lg">

            <CardHeader>
              <CardTitle>
                Book Appointment
              </CardTitle>
            </CardHeader>

            <CardContent>

              {booked ? (

                <div className="py-8 text-center">

                  <CheckCircle className="mx-auto mb-4 h-16 w-16 text-green-500" />

                  <h3 className="text-xl font-bold">
                    Appointment Confirmed!
                  </h3>

                  <Button
                    className="mt-6"
                    onClick={() => {
                      setBooked(false);
                      setPatientName("");
                      setSelectedHospital("");
                      setSelectedDoctor("");
                      setSelectedTimeSlot("");
                      setSelectedDate("");
                    }}
                  >
                    Book Another
                  </Button>

                </div>

              ) : (

                <form
                  onSubmit={handleBookAppointment}
                  className="space-y-4"
                >

                  {/* Patient Name */}

                  <div>

                    <Label>
                      Patient Name
                    </Label>

                    <Input
                      placeholder="Your full name"
                      value={patientName}
                      onChange={handleNameChange}
                      required
                    />

                    {nameError && (
                      <p className="text-sm text-red-500">
                        {nameError}
                      </p>
                    )}

                  </div>

                  {/* Hospital */}

                  <div>

                    <Label>
                      Hospital
                    </Label>

                    <Select
                      value={selectedHospital}
                      onValueChange={handleHospitalChange}
                    >

                      <SelectTrigger>
                        <SelectValue placeholder="Select hospital" />
                      </SelectTrigger>

                      <SelectContent>

                        {hospitals.map((hospital) => (
                          <SelectItem
                            key={hospital.hospital_id}
                            value={hospital.name}
                          >
                            {hospital.name}
                          </SelectItem>
                        ))}

                      </SelectContent>

                    </Select>

                  </div>

                  {/* Doctor */}

                  <div>

                    <Label>
                      Doctor
                    </Label>

                    {loadingDoctors ? (

                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading doctors...
                      </div>

                    ) : (

                      <Select
                        value={selectedDoctor}
                        onValueChange={handleDoctorChange}
                        disabled={!selectedHospital}
                      >

                        <SelectTrigger>
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>

                        <SelectContent>

                          {filteredDoctorsByHospital.map(
                            (doctor) => (
                              <SelectItem
                                key={doctor.id}
                                value={String(doctor.id)}
                              >
                                {doctor.name} –{" "}
                                {doctor.specialization}
                              </SelectItem>
                            )
                          )}

                        </SelectContent>

                      </Select>

                    )}

                  </div>

                  {/* Date + Time */}

                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <Label>
                        Date
                      </Label>

                      <Input
                        type="date"
                        min={today}
                        value={selectedDate}
                        onChange={(e) =>
                          setSelectedDate(e.target.value)
                        }
                        required
                      />

                    </div>

                    <div>

                      <Label>
                        Time Slot
                      </Label>

                      {loadingSlots ? (

                        <div className="flex items-center gap-2 pt-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading...
                        </div>

                      ) : (

                        <Select
                          value={selectedTimeSlot}
                          onValueChange={setSelectedTimeSlot}
                          disabled={!selectedDoctor}
                        >

                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>

                          <SelectContent>

                            {availableTimeSlots.map(
                              (time) => (
                                <SelectItem
                                  key={time}
                                  value={time}
                                >
                                  {time}
                                </SelectItem>
                              )
                            )}

                          </SelectContent>

                        </Select>

                      )}

                    </div>

                  </div>

                  {/* Error */}

                  {appointmentError && (
                    <p className="text-sm text-destructive">
                      {appointmentError}
                    </p>
                  )}

                  {/* Submit */}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !patientName ||
                      nameError !== "" ||
                      !selectedHospital ||
                      !selectedDoctor ||
                      !selectedDate ||
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

        {/* ===============================
            BED AVAILABILITY
        =============================== */}

        {tab === "beds" && (

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead>

                <tr className="border-b bg-muted text-left">

                  <th className="p-3 font-display font-semibold">
                    Hospital
                  </th>

                  <th className="p-3 text-center font-display font-semibold">
                    General Beds
                  </th>

                  <th className="p-3 text-center font-display font-semibold">
                    ICU Beds
                  </th>


                  <th className="p-3 text-center font-display font-semibold">
                    Emergency
                  </th>
                  
                  <th className="p-3 text-center font-display font-semibold">
                    Queue
                  </th>
                  
                  <th className="p-3 text-center font-display font-semibold">
                    Status
                  </th>
                  
                  

                  <th className="p-3 text-center font-display font-semibold">
                    Waiting Time
                  </th>

                  </tr>

              </thead>

              <tbody>

                {hospitals.map((hospital) => (

                  <tr
                    key={hospital.hospital_id}
                    className="border-b transition-colors hover:bg-muted/50"
                  >

                    <td className="p-3 font-medium text-foreground">
                      {hospital.name}
                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                          hospital.general > 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {hospital.general > 0
                          ? hospital.general
                          : "Full"}
                      </span>

                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                          hospital.icu > 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {hospital.icu > 0
                          ? hospital.icu
                          : "Full"}
                      </span>

                    </td>

                    <td className="p-3 text-center">

                      <span
                        className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                          hospital.emergency > 0
                            ? "bg-success/10 text-success"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {hospital.emergency > 0
                          ? hospital.emergency
                          : "Full"}
                      </span>

                    </td>

                    <td className="p-3 text-center">
                      <span className="font-semibold text-foreground">
                        {hospital.queueCount}
                      </span>
                    
                      <p className="text-xs text-muted-foreground">
                        patients waiting
                      </p>
                    </td>
                    
                    <td className="p-3 text-center">
                      <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800">
                        {hospital.statusMode || "DEMO"}
                     </span>
                    </td>


                    <td className="p-3 text-center">
                      <span className="font-semibold text-foreground">
                        {waitingTimes[hospital.hospital_id] ?? "--"} min
                      </span>
                    
                      <p className="text-xs text-muted-foreground">
                        predicted
                      </p>
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