import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const HospitalRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    hospital_name: "",
    address: "",
    phone: "",
    email: "",
    password: "",
    hospital_type: "",
    registration_number: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.hospital_name ||
      !formData.address ||
      !formData.email ||
      !formData.password
    ) {
      setError(
        "Please fill in hospital name, address, email and password."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/hospital-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude
            ? Number(formData.latitude)
            : null,
          longitude: formData.longitude
            ? Number(formData.longitude)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Hospital registration failed.");
        return;
      }

      setSuccess(
        "Registration submitted successfully! Your hospital is waiting for admin approval."
      );

      setFormData({
        hospital_name: "",
        address: "",
        phone: "",
        email: "",
        password: "",
        hospital_type: "",
        registration_number: "",
        latitude: "",
        longitude: "",
      });
    } catch (error) {
      console.error(error);

      setError(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            SmartCare
          </h1>

          <p className="text-gray-500 mt-2">
            Register Your Hospital
          </p>

          <p className="text-sm text-gray-400 mt-1">
            Registration is subject to admin verification.
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-5">

          {/* Hospital Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Name *
            </label>

            <input
              type="text"
              name="hospital_name"
              value={formData.hospital_name}
              onChange={handleChange}
              placeholder="Enter hospital name"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Address *
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter complete hospital address"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone + Hospital Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hospital Type
              </label>

              <select
                name="hospital_type"
                value={formData.hospital_type}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="General Hospital">
                  General Hospital
                </option>
                <option value="Multi-Specialty Hospital">
                  Multi-Specialty Hospital
                </option>
                <option value="Government Hospital">
                  Government Hospital
                </option>
                <option value="Private Hospital">
                  Private Hospital
                </option>
                <option value="Specialty Hospital">
                  Specialty Hospital
                </option>
              </select>
            </div>

          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Email *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter official hospital email"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Registration Number
            </label>

            <input
              type="text"
              name="registration_number"
              value={formData.registration_number}
              onChange={handleChange}
              placeholder="Enter registration/license number"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Coordinates
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="number"
                step="any"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="Latitude"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                type="number"
                step="any"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="Longitude"
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <p className="text-xs text-gray-400 mt-2">
              Coordinates help SmartCare find nearby hospitals.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg p-3">
              {success}
            </div>
          )}

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Submitting Registration..." : "Register Hospital"}
          </button>

        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/hospital-login")}
            className="text-blue-600 font-semibold hover:underline"
          >
            ← Back to Hospital Login
          </button>
        </div>

      </div>
    </div>
  );
};

export default HospitalRegister;