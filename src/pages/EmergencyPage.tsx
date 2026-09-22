import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  Phone,
  Bed,
  MapPin,
  ArrowLeft,
  Heart,
  Users,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_URL = "http://localhost:5001/api";

type Hospital = {
  hospital_id: number;
  name: string;
  address: string;
  phone: string;
  latitude: number | string | null;
  longitude: number | string | null;
  icu_available: number;
  general_available: number;
  emergency_available: number;
  queue_count: number;
  status_mode: string;
  updated_at: string;
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

// Haversine distance formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const EmergencyPage = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [userLocation, setUserLocation] =
    useState<UserLocation | null>(null);

  const [locationStatus, setLocationStatus] = useState(
    "Getting your location..."
  );

  useEffect(() => {
    const fetchEmergencyHospitals = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/emergency-hospitals`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch emergency hospitals.");
        }

        const data: Hospital[] = await response.json();

        setHospitals(data);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to load hospital information. Please make sure the backend is running."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEmergencyHospitals();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Location services are not supported by this browser."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        setLocationStatus("Location detected");
      },
      (error) => {
        console.error(error);

        setLocationStatus(
          "Location permission denied. Distance cannot be calculated."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Calculate distance for each hospital
  const getHospitalDistance = (hospital: Hospital) => {
    if (
      !userLocation ||
      hospital.latitude === null ||
      hospital.longitude === null
    ) {
      return null;
    }

    const hospitalLatitude = Number(hospital.latitude);
    const hospitalLongitude = Number(hospital.longitude);

    if (
      Number.isNaN(hospitalLatitude) ||
      Number.isNaN(hospitalLongitude)
    ) {
      return null;
    }

    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      hospitalLatitude,
      hospitalLongitude
    );
  };

  // Sort:
  // 1. Hospitals with ICU beds first
  // 2. Among them, nearest hospital first
  const sortedHospitals = [...hospitals].sort((a, b) => {
    const aDistance = getHospitalDistance(a);
    const bDistance = getHospitalDistance(b);

    if (a.icu_available > 0 && b.icu_available === 0) {
      return -1;
    }

    if (a.icu_available === 0 && b.icu_available > 0) {
      return 1;
    }

    if (aDistance !== null && bDistance !== null) {
      return aDistance - bDistance;
    }

    return b.icu_available - a.icu_available;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Header */}
      <header className="bg-destructive px-4 py-6 text-destructive-foreground">
        <div className="container mx-auto">
          <div className="mb-4 flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive-foreground hover:bg-destructive-foreground/10"
              asChild
            >
              <Link to="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>

            <Heart className="h-6 w-6" fill="currentColor" />
          </div>

          <div className="text-center">
            <AlertTriangle className="mx-auto mb-3 h-12 w-12 emergency-pulse" />

            <h1 className="font-display text-3xl font-extrabold md:text-4xl">
              EMERGENCY MODE
            </h1>

            <p className="mt-2 text-lg opacity-90">
              Find nearby hospitals with ICU availability
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive-foreground/20 px-5 py-2 text-lg font-bold">
              <Phone className="h-5 w-5" />
              Call 108
            </div>
          </div>
        </div>
      </header>

      {/* Hospital List */}
      <div className="container mx-auto px-4 py-6">

        {/* Location Status */}
        <div className="mb-6 flex items-center gap-3 rounded-lg border bg-card p-4">
          <Navigation className="h-5 w-5 text-primary" />

          <div>
            <p className="font-semibold text-foreground">
              Your Location
            </p>

            <p className="text-sm text-muted-foreground">
              {locationStatus}
            </p>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
          <p className="font-semibold text-foreground">
            DEMO MODE
          </p>

          <p className="mt-1 text-muted-foreground">
            Hospital availability is currently provided through
            the hospital dashboard and is not verified live hospital data.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />

            <p className="mt-3 text-muted-foreground">
              Loading hospital availability...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-destructive" />

            <p className="font-semibold text-foreground">
              Unable to load hospitals
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              {error}
            </p>
          </div>
        )}

        {/* No Hospitals */}
        {!loading && !error && hospitals.length === 0 && (
          <div className="rounded-lg border bg-card p-8 text-center">
            <Bed className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <p className="font-semibold text-foreground">
              No hospital information available
            </p>
          </div>
        )}

        {/* Hospitals */}
        {!loading && !error && hospitals.length > 0 && (
          <div className="space-y-4">
            {sortedHospitals.map((hospital) => {
              const distance = getHospitalDistance(hospital);

              return (
                <div
                  key={hospital.hospital_id}
                  className={`rounded-lg border p-5 transition-shadow hover:shadow-md ${
                    hospital.icu_available === 0
                      ? "border-destructive/30 bg-destructive/5 opacity-70"
                      : "bg-card"
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    {/* Hospital Information */}
                    <div className="flex-1">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {hospital.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">

                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />

                          {distance !== null
                            ? `${distance.toFixed(1)} km away`
                            : "Distance unavailable"}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          Queue: {hospital.queue_count}
                        </span>

                        {hospital.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {hospital.phone}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        {hospital.address || "Address unavailable"}
                      </p>
                    </div>

                    {/* Availability */}
                    <div className="flex flex-wrap items-center gap-5">

                      {/* General Beds */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Bed className="h-4 w-4 text-muted-foreground" />

                          <span className="text-xs text-muted-foreground">
                            General
                          </span>
                        </div>

                        <span className="font-display text-2xl font-bold text-success">
                          {hospital.general_available}
                        </span>
                      </div>

                      {/* ICU Beds */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Bed className="h-4 w-4 text-muted-foreground" />

                          <span className="text-xs text-muted-foreground">
                            ICU
                          </span>
                        </div>

                        <span
                          className={`font-display text-2xl font-bold ${
                            hospital.icu_available > 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {hospital.icu_available > 0
                            ? hospital.icu_available
                            : "Full"}
                        </span>
                      </div>

                      {/* Emergency Beds */}
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />

                          <span className="text-xs text-muted-foreground">
                            Emergency
                          </span>
                        </div>

                        <span
                          className={`font-display text-2xl font-bold ${
                            hospital.emergency_available > 0
                              ? "text-success"
                              : "text-destructive"
                          }`}
                        >
                          {hospital.emergency_available}
                        </span>
                      </div>

                      {/* Hospital Actions */}
                      <div className="flex flex-wrap gap-2">

                        {/* Open in Google Maps */}
                        {hospital.latitude !== null &&
                          hospital.longitude !== null && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${hospital.latitude},${hospital.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5"
                              >
                                <MapPin className="h-4 w-4" />
                                Open in Maps
                              </Button>
                            </a>
                          )}

                        {/* Call Hospital */}
                        {hospital.phone && (
                          <a href={`tel:${hospital.phone}`}>
                            <Button
                              variant={
                                hospital.icu_available > 0
                                  ? "default"
                                  : "outline"
                              }
                              size="sm"
                              className="gap-1.5"
                            >
                              <Phone className="h-4 w-4" />
                              Call
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-4 border-t pt-3 text-xs text-muted-foreground">
                    Status:{" "}
                    <span className="font-semibold">
                      {hospital.status_mode}
                    </span>
                    {" • "}
                    Last updated:{" "}
                    {new Date(
                      hospital.updated_at
                    ).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmergencyPage;