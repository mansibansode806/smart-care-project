import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const HospitalDashboard = () => {
  const navigate = useNavigate();

  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [hospitalName, setHospitalName] = useState("");

  const [general, setGeneral] = useState("");
  const [icu, setIcu] = useState("");
  const [emergency, setEmergency] = useState("");
  const [queue, setQueue] = useState("");

  const [predictedWaitingTime, setPredictedWaitingTime] =
    useState<number | null>(null);

  const [lastUpdated, setLastUpdated] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [updatingAppointment, setUpdatingAppointment] =
    useState<number | null>(null);

  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [doctorName, setDoctorName] = useState("");
  const [doctorSpecialization, setDoctorSpecialization] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [doctorDays, setDoctorDays] = useState<string[]>([]);
  const [doctorStartTime, setDoctorStartTime] = useState("09:00");
  const [doctorEndTime, setDoctorEndTime] = useState("13:00");
  const [addingDoctor, setAddingDoctor] = useState(false);

  // Check hospital login session
  useEffect(() => {
    const session = localStorage.getItem("smartcare_hospital_session");

    if (!session) {
      navigate("/hospital-login");
      return;
    }

    try {
      const hospital = JSON.parse(session);

      if (!hospital?.hospital_id) {
        localStorage.removeItem("smartcare_hospital_session");
        navigate("/hospital-login");
        return;
      }

      setHospitalId(hospital.hospital_id);
      setHospitalName(hospital.hospital_name || "Hospital");
    } catch (error) {
      console.error("Invalid hospital session:", error);
      localStorage.removeItem("smartcare_hospital_session");
      navigate("/hospital-login");
    }
  }, [navigate]);

  // Get doctors
  const fetchDoctors = async () => {
    if (!hospitalId) return;

    try {
      const response = await fetch(
        `${API_URL}/doctors?hospital_id=${hospitalId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch doctors");
      }

      const data = await response.json();
      setDoctors(data);
    } catch (error) {
      console.error("Failed to load doctors:", error);
    }
  };

  // Get booked appointments
  const fetchAppointments = async () => {
    if (!hospitalId) return;

    try {
      const response = await fetch(
        `${API_URL}/hospital-appointments/${hospitalId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch appointments");
      }

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    }
  };

  // Update appointment status
  const updateAppointmentStatus = async (
    appointmentId: number,
    status: "Accepted" | "Rejected" | "Completed"
  ) => {
    setUpdatingAppointment(appointmentId);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/appointments/${appointmentId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update appointment"
        );
      }

      if (status === "Accepted") {
        setMessage("Appointment accepted successfully!");
      } else if (status === "Rejected") {
        setMessage("Appointment rejected successfully!");
      } else {
        setMessage("Appointment marked as completed!");
      }

      await fetchAppointments();
    } catch (error) {
      console.error("Appointment status update error:", error);
      setMessage("Failed to update appointment status.");
    } finally {
      setUpdatingAppointment(null);
    }
  };

  // Get current hospital status
  const fetchStatus = async () => {
    if (!hospitalId) return;

    try {
      const response = await fetch(
        `${API_URL}/hospital-status/${hospitalId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch hospital status");
      }

      const data = await response.json();

      setGeneral(String(data.general_available ?? 0));
      setIcu(String(data.icu_available ?? 0));
      setEmergency(String(data.emergency_available ?? 0));
      setQueue(String(data.queue_count ?? 0));
      setLastUpdated(data.updated_at || "");

      const waitingResponse = await fetch(
        `${API_URL}/hospital-waiting-time/${hospitalId}`
      );

      if (waitingResponse.ok) {
        const waitingData = await waitingResponse.json();

        setPredictedWaitingTime(
          waitingData.predicted_waiting_minutes ?? null
        );
      }
    } catch (error) {
      console.error(error);
      setMessage("Unable to load hospital status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hospitalId) {
      fetchStatus();
      fetchDoctors();
      fetchAppointments();
    }
  }, [hospitalId]);

  // Update hospital status
  const updateStatus = async () => {
    setMessage("");

    if (
      general === "" ||
      icu === "" ||
      emergency === "" ||
      queue === ""
    ) {
      setMessage("Please enter all values.");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(
        `${API_URL}/hospital-status/${hospitalId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            general_available: Number(general),
            icu_available: Number(icu),
            emergency_available: Number(emergency),
            queue_count: Number(queue),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Update failed");
      }

      setMessage("Hospital status updated successfully!");

      await fetchStatus();
    } catch (error) {
      console.error(error);
      setMessage("Failed to update hospital status.");
    } finally {
      setUpdating(false);
    }
  };

  // Add doctor
  const addDoctor = async () => {
    if (!doctorName || !doctorSpecialization || !hospitalId) {
      setMessage("Please enter doctor name and specialization.");
      return;
    }

    setAddingDoctor(true);
    setMessage("");

    try {
      console.log("Doctor days:", doctorDays);

      console.log("Sending doctor data:", {
        name: doctorName,
        specialization: doctorSpecialization,
        phone: doctorPhone,
        hospital_id: hospitalId,
        schedules: doctorDays,
      });

      const response = await fetch(`${API_URL}/doctors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: doctorName,
          specialization: doctorSpecialization,
          phone: doctorPhone,
          hospital_id: hospitalId,

          schedules: doctorDays.map((day) => ({
            day_of_week: day,
            start_time: doctorStartTime,
            end_time: doctorEndTime,
            slot_duration: 30,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add doctor");
      }

      setMessage("Doctor added successfully!");

      setDoctorName("");
      setDoctorSpecialization("");
      setDoctorPhone("");
      setDoctorDays([]);
      setDoctorStartTime("09:00");
      setDoctorEndTime("13:00");
      setShowAddDoctor(false);

      await fetchDoctors();
    } catch (error) {
      console.error(error);
      setMessage("Failed to add doctor.");
    } finally {
      setAddingDoctor(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("smartcare_hospital_session");
    navigate("/hospital-login");
  };

  // Open AI Bed Prediction page
  const handleAIPrediction = () => {
    navigate("/ai-prediction");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">
          Loading hospital dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">
                Hospital Administration
              </p>

              <h1 className="text-3xl font-bold text-gray-900">
                {hospitalName}
              </h1>

              <p className="text-gray-500 mt-2">
                Update current bed availability and patient queue.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100"
            >
              Logout
            </button>
          </div>

          <div className="mt-4 inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
            DEMO MODE
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

          {/* General Beds */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">
              General Beds Available
            </p>

            <input
              type="number"
              min="0"
              value={general}
              onChange={(e) => setGeneral(e.target.value)}
              className="mt-3 w-full border rounded-lg px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* ICU Beds */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">
              ICU Beds Available
            </p>

            <input
              type="number"
              min="0"
              value={icu}
              onChange={(e) => setIcu(e.target.value)}
              className="mt-3 w-full border rounded-lg px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Emergency Beds */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-gray-500 text-sm">
              Emergency Beds Available
            </p>

            <input
              type="number"
              min="0"
              value={emergency}
              onChange={(e) => setEmergency(e.target.value)}
              className="mt-3 w-full border rounded-lg px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Queue */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-gray-500 text-sm">
            Current Patient Queue
          </p>

          <input
            type="number"
            min="0"
            value={queue}
            onChange={(e) => setQueue(e.target.value)}
            className="mt-3 w-full md:w-1/2 border rounded-lg px-4 py-3 text-2xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
          />

          <p className="text-sm text-gray-500 mt-2">
            Number of patients currently waiting.
          </p>
        </div>

        {/* AI Predicted Waiting Time */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <p className="text-gray-500 text-sm">
            AI Predicted Waiting Time
          </p>

          <div className="mt-3">
            {predictedWaitingTime !== null ? (
              <p className="text-3xl font-bold text-blue-600">
                {predictedWaitingTime} minutes
              </p>
            ) : (
              <p className="text-gray-500">
                Prediction unavailable
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Estimated waiting time based on the current hospital queue.
          </p>

          <p className="text-xs text-gray-400 mt-2">
            Powered by Random Forest ML
          </p>
        </div>

        {/* AI Bed Prediction Button */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-900 text-lg font-semibold">
                AI Bed & ICU Demand Prediction
              </p>

              <p className="text-sm text-gray-500 mt-1">
                View next-day ICU demand and 7-day AI forecast.
              </p>
            </div>

            <button
              onClick={handleAIPrediction}
              className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              View AI Bed Prediction
            </button>
          </div>
        </div>

        {/* Manage Doctors */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-gray-900 text-lg font-semibold">
                Manage Doctors
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Doctors registered under {hospitalName}.
              </p>
            </div>

            <button
              onClick={() => setShowAddDoctor(!showAddDoctor)}
              className="px-5 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
            >
              {showAddDoctor ? "Cancel" : "+ Add Doctor"}
            </button>
          </div>

          {/* Add Doctor Form */}
          {showAddDoctor && (
            <div className="mt-6 border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="md:col-span-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Working Days
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                    ].map((day) => (
                      <label
                        key={day}
                        className="flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={doctorDays.includes(day)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDoctorDays([
                                ...doctorDays,
                                day,
                              ]);
                            } else {
                              setDoctorDays(
                                doctorDays.filter(
                                  (selectedDay) =>
                                    selectedDay !== day
                                )
                              );
                            }
                          }}
                        />

                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={doctorStartTime}
                      onChange={(e) =>
                        setDoctorStartTime(e.target.value)
                      }
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={doctorEndTime}
                      onChange={(e) =>
                        setDoctorEndTime(e.target.value)
                      }
                      className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Doctor Name"
                  value={doctorName}
                  onChange={(e) =>
                    setDoctorName(e.target.value)
                  }
                  className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Specialization"
                  value={doctorSpecialization}
                  onChange={(e) =>
                    setDoctorSpecialization(e.target.value)
                  }
                  className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                  type="text"
                  placeholder="Phone Number"
                  value={doctorPhone}
                  onChange={(e) =>
                    setDoctorPhone(e.target.value)
                  }
                  className="border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={addDoctor}
                disabled={addingDoctor}
                className="mt-4 px-6 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {addingDoctor ? "Adding..." : "Save Doctor"}
              </button>
            </div>
          )}

          {/* Doctor List */}
          <div className="mt-6 space-y-3">
            {doctors.length === 0 ? (
              <p className="text-sm text-gray-500">
                No doctors added yet.
              </p>
            ) : (
              doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {doctor.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {doctor.specialization}
                    </p>

                    {doctor.schedules?.length > 0 && (
                      <div className="text-sm text-blue-600 mt-1">
                        {doctor.schedules.map((schedule: any) => (
                          <div key={schedule.day_of_week}>
                            {schedule.day_of_week} •{" "}
                            {schedule.start_time?.slice(0, 5)} -{" "}
                            {schedule.end_time?.slice(0, 5)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {doctor.phone && (
                    <p className="text-sm text-gray-600">
                      {doctor.phone}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Booked Appointments */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Booked Appointments
          </h2>

          {appointments.length === 0 ? (
            <p className="text-gray-500">
              No appointments booked yet.
            </p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.appointment_id}
                  className="border rounded-xl p-4"
                >
                  <p className="font-semibold text-gray-800">
                    {appointment.patient_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    Doctor: {appointment.doctor_name}
                  </p>

                  <p className="text-sm text-gray-600">
                    Specialization:{" "}
                    {appointment.specialization}
                  </p>

                  <p className="text-sm text-gray-600">
                    Date: {appointment.appointment_date}
                  </p>

                  <p className="text-sm text-gray-600">
                    Time: {appointment.appointment_time}
                  </p>

                  <p className="text-sm text-gray-600">
                    Status: {appointment.status}
                  </p>

                  {/* Pending Appointment */}
                  {appointment.status === "Pending" && (
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.appointment_id,
                            "Accepted"
                          )
                        }
                        disabled={
                          updatingAppointment ===
                          appointment.appointment_id
                        }
                        className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingAppointment ===
                        appointment.appointment_id
                          ? "Updating..."
                          : "Accept"}
                      </button>

                      <button
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.appointment_id,
                            "Rejected"
                          )
                        }
                        disabled={
                          updatingAppointment ===
                          appointment.appointment_id
                        }
                        className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Accepted Appointment */}
                  {appointment.status === "Accepted" && (
                    <button
                      onClick={() =>
                        updateAppointmentStatus(
                          appointment.appointment_id,
                          "Completed"
                        )
                      }
                      disabled={
                        updatingAppointment ===
                        appointment.appointment_id
                      }
                      className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {updatingAppointment ===
                      appointment.appointment_id
                        ? "Updating..."
                        : "Mark as Completed"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Update Button */}
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <button
            onClick={updateStatus}
            disabled={updating || !hospitalId}
            className="w-full md:w-auto px-8 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {updating
              ? "Updating..."
              : "Update Hospital Status"}
          </button>

          {message && (
            <p className="mt-4 text-sm font-medium text-gray-700">
              {message}
            </p>
          )}

          {lastUpdated && (
            <p className="mt-4 text-sm text-gray-500">
              Last Updated:{" "}
              {new Date(lastUpdated).toLocaleString()}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};

export default HospitalDashboard;