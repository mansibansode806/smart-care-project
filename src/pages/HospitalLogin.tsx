import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5001/api";

const HospitalLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/hospital-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid hospital login.");
        return;
      }

      // Save hospital session
      localStorage.setItem(
        "smartcare_hospital_session",
        JSON.stringify(data.hospital)
      );

      // Go to hospital dashboard
      navigate("/hospital-dashboard");
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            SmartCare
          </h1>

          <p className="text-gray-500 mt-2">
            Hospital Administration Login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter hospital email"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Hospital Login"}
          </button>

        </form>

        {/* Hospital Registration */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            New hospital?
          </p>

          <button
            type="button"
            onClick={() => navigate("/hospital-register")}
            className="text-blue-600 font-semibold hover:underline mt-1"
          >
            Register your hospital
          </button>
        </div>

        {/* Demo Information */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm font-semibold text-yellow-800">
            Prototype Demo
          </p>

          <p className="text-xs text-yellow-700 mt-1">
            Hospital credentials are configured for the SIH prototype.
          </p>
        </div>

      </div>
    </div>
  );
};

export default HospitalLogin;