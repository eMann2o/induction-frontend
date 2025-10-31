import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router";
import Footer from "~/components/footer";

const API_URL = "http://localhost:3000";

export default function JoinSessionPage() {
  const { id } = useParams();
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/sessions/${id}/scan`, { phone });

      if (res.data.success) {
        Swal.fire({
          title: "Access Granted!",
          text: `Welcome ${res.data.trainee.name}. Redirecting to your questions...`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
          backdrop: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        setTimeout(() => {
          navigate(`/trainee/session/${id}/questions?phone=${encodeURIComponent(phone)}`);
        }, 2000);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to join session. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4 pt-24">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <span className="material-symbols-rounded text-blue-600 text-3xl">
                  badge
                </span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join Induction Session
            </h1>
            <p className="text-gray-600 text-sm">
              Enter your registered phone number to access the training.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-xl mt-0.5">
                error
              </span>
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleJoin} className="space-y-6">
            {/* Phone Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-rounded text-gray-400 text-xl">
                  phone
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter your phone number"
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Make sure you're using your registered phone number
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                loading || !phone.trim()
                  ? "bg-gray-400 cursor-not-allowed opacity-60"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-95"
              }`}
            >
              {loading ? (
                <>
                  <span className="material-symbols-rounded animate-spin">
                    progress_activity
                  </span>
                  <span>Joining Session...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded text-lg">
                    login
                  </span>
                  <span>Join Session</span>
                </>
              )}
            </button>
          </form>

          {/* Helper Text */}
          <p className="text-center text-xs text-gray-500 mt-6">
            Having trouble? Contact support for assistance
          </p>
        </div>
      </div>
    </div>
  );
}