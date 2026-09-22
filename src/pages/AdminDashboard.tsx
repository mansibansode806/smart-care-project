import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  BarChart3,
  ArrowLeft,
  Check,
  X,
  Building2,
  Clock,
  ShieldCheck,
  Hospital,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ChatbotWidget } from "@/components/ChatbotWidget";

const API_URL = "http://localhost:5001/api";

type AdminTab = "overview" | "hospital-registrations";

const AdminDashboard = () => {
  const [tab, setTab] = useState<AdminTab>("overview");

  const [hospitalRegistrations, setHospitalRegistrations] = useState<any[]>(
    []
  );

  const [totalHospitals, setTotalHospitals] = useState(0);

  const [loading, setLoading] = useState(true);

  // ===============================
  // FETCH HOSPITAL REGISTRATIONS
  // ===============================

  const fetchHospitalRegistrations = async () => {
    try {
      const response = await fetch(
        `${API_URL}/hospital-registration-requests`
      );

      const data = await response.json();

      if (response.ok) {
        setHospitalRegistrations(data);
      }
    } catch (error) {
      console.error("Failed to fetch hospital registrations:", error);
    }
  };

  // ===============================
// APPROVE HOSPITAL
// ===============================

const approveHospital = async (registrationId: number) => {
  try {
    const response = await fetch(
      `${API_URL}/hospital-registration/${registrationId}/approve`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to approve hospital.");
      return;
    }

    alert("Hospital approved successfully!");

    fetchHospitalRegistrations();
    fetchHospitals();
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
  }
};

// ===============================
// REJECT HOSPITAL
// ===============================

const rejectHospital = async (registrationId: number) => {
  try {
    const response = await fetch(
      `${API_URL}/hospital-registration/${registrationId}/reject`,
      {
        method: "PUT",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to reject hospital.");
      return;
    }

    alert("Hospital registration rejected.");

    fetchHospitalRegistrations();
  } catch (error) {
    console.error(error);
    alert("Unable to connect to the server.");
  }
};

  // ===============================
  // FETCH APPROVED HOSPITALS
  // ===============================

  const fetchHospitals = async () => {
    try {
      const response = await fetch(`${API_URL}/hospitals`);

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setTotalHospitals(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    }
  };

  // ===============================
  // LOAD ADMIN DATA
  // ===============================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      await Promise.all([
        fetchHospitalRegistrations(),
        fetchHospitals(),
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  // ===============================
  // CALCULATE REGISTRATION COUNTS
  // ===============================

  const pendingHospitals = hospitalRegistrations.filter(
    (hospital) => hospital.status === "PENDING"
  ).length;

  const approvedRegistrations = hospitalRegistrations.filter(
    (hospital) => hospital.status === "APPROVED"
  ).length;

  const rejectedRegistrations = hospitalRegistrations.filter(
    (hospital) => hospital.status === "REJECTED"
  ).length;

  // ===============================
  // TABS
  // ===============================

  const tabs: {
    key: AdminTab;
    label: string;
    icon: typeof Building2;
  }[] = [
    {
      key: "overview",
      label: "Overview",
      icon: BarChart3,
    },
    {
      key: "hospital-registrations",
      label: "Hospital Registrations",
      icon: Heart,
    },
  ];

  // ===============================
  // UI
  // ===============================

  return (
    <div className="min-h-screen bg-background">

      {/* ===============================
          HEADER
      =============================== */}

      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center gap-3 px-4">

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
            Admin Dashboard
          </span>

        </div>
      </header>

      {/* ===============================
          MAIN CONTENT
      =============================== */}

      <div className="container mx-auto px-4 py-6">

        {/* ===============================
            TABS
        =============================== */}

        <div className="mb-6 flex gap-2 overflow-x-auto">

          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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

        {/* =====================================================
            OVERVIEW
        ===================================================== */}

        {tab === "overview" && (
          <div className="space-y-6">

            {/* Heading */}

            <div>
              <h2 className="text-2xl font-bold">
                SmartCare Platform Overview
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Monitor hospitals and registration activity across the
                SmartCare platform.
              </p>
            </div>

            {/* ===============================
                STATISTICS
            =============================== */}

            {loading ? (
              <div className="py-10 text-center text-muted-foreground">
                Loading platform information...
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                {/* Total Hospitals */}

                <Card>
                  <CardContent className="flex items-center gap-4 p-5">

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Hospital className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Hospitals
                      </p>

                      <p className="font-display text-2xl font-bold">
                        {totalHospitals}
                      </p>
                    </div>

                  </CardContent>
                </Card>

                {/* Approved Hospitals */}

                <Card>
                  <CardContent className="flex items-center gap-4 p-5">

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Approved Hospitals
                      </p>

                      <p className="font-display text-2xl font-bold">
                        {totalHospitals}
                      </p>
                    </div>

                  </CardContent>
                </Card>

                {/* Pending Registrations */}

                <Card>
                  <CardContent className="flex items-center gap-4 p-5">

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pending Registrations
                      </p>

                      <p className="font-display text-2xl font-bold">
                        {pendingHospitals}
                      </p>
                    </div>

                  </CardContent>
                </Card>

                {/* Registration Requests */}

                <Card>
                  <CardContent className="flex items-center gap-4 p-5">

                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Requests
                      </p>

                      <p className="font-display text-2xl font-bold">
                        {hospitalRegistrations.length}
                      </p>
                    </div>

                  </CardContent>
                </Card>

              </div>
            )}

            {/* ===============================
                REGISTRATION SUMMARY
            =============================== */}

            <Card>

              <CardHeader>
                <CardTitle className="font-display">
                  Hospital Registration Summary
                </CardTitle>
              </CardHeader>

              <CardContent>

                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Pending
                    </p>

                    <p className="mt-1 text-2xl font-bold text-yellow-600">
                      {pendingHospitals}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Approved Requests
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-600">
                      {approvedRegistrations}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">
                      Rejected Requests
                    </p>

                    <p className="mt-1 text-2xl font-bold text-red-600">
                      {rejectedRegistrations}
                    </p>
                  </div>

                </div>

                {/* Go to registrations */}

                {pendingHospitals > 0 && (
                  <Button
                    className="mt-5"
                    onClick={() =>
                      setTab("hospital-registrations")
                    }
                  >
                    Review Pending Registrations
                  </Button>
                )}

              </CardContent>

            </Card>

          </div>
        )}

        {/* =====================================================
            HOSPITAL REGISTRATIONS
        ===================================================== */}

        {tab === "hospital-registrations" && (
          <div className="space-y-4">

            <div>
              <h2 className="text-xl font-bold">
                Hospital Registration Requests
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Review hospitals waiting for admin verification.
              </p>
            </div>

            {hospitalRegistrations.length === 0 ? (

              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No hospital registration requests found.
                </CardContent>
              </Card>

            ) : (

              hospitalRegistrations.map((hospital) => (

                <Card key={hospital.registration_id}>

                  <CardContent className="p-5">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      {/* Hospital Information */}

                      <div>

                        <h3 className="text-lg font-semibold">
                          {hospital.hospital_name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {hospital.hospital_type || "Hospital"}
                        </p>

                        <p className="mt-2 text-sm">
                          {hospital.address}
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Email: {hospital.email}
                        </p>

                        {hospital.phone && (
                          <p className="text-sm text-muted-foreground">
                            Phone: {hospital.phone}
                          </p>
                        )}

                        {/* Status */}

                        <span
                          className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                            hospital.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : hospital.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {hospital.status}
                        </span>

                      </div>

                      {/* Actions */}

                      {hospital.status === "PENDING" && (
                        <div className="flex gap-2">

                          <Button
                            size="sm"
                            onClick={() => approveHospital(hospital.registration_id)}
                          >
                            <Check className="mr-1 h-4 w-4" />
                            Approve
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectHospital(hospital.registration_id)}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Reject
                          </Button>

                        </div>
                      )}

                    </div>

                  </CardContent>

                </Card>

              ))

            )}

          </div>
        )}

      </div>

      {/* Chatbot */}

      <ChatbotWidget />

    </div>
  );
};

export default AdminDashboard;