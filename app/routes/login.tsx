import { useState } from "react";
import api from "./../utils/api";
import { useNavigate } from "react-router";
import Title from "~/components/Title";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/login", { email, password });
      const { user } = res.data;

      // 🟢 Save both the token and user info
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));

      // 🔁 Optional: remember last route (for redirect back after login)
      const redirectTo = sessionStorage.getItem("redirectAfterLogin") || "/";
      sessionStorage.removeItem("redirectAfterLogin");

      // Role-based redirects
      switch (user.role) {
        case "superadmin":
          navigate("/admin");
          break;
        case "facilitator":
          navigate("/facilitator");
          break;
        case "hr":
          navigate("/hr");
          break;
        case "hse":
          navigate("/hse");
          break;
        
        default:
          navigate(redirectTo);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Title title="Login" />
      {/* Left Side - Login Form */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-8 py-12">
        <div className="max-w-md mx-auto w-full">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Adamus</span>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
              <p className="mt-2 text-gray-600">
                Sign in to your account to continue
              </p>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  email
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  <span className="material-symbols-rounded">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <span className="material-symbols-rounded text-red-600 flex-shrink-0 mt-0.5">
                  error
                </span>
                <div>
                  <h3 className="font-semibold text-red-900 text-sm">
                    Login Failed
                  </h3>
                  <p className="text-red-700 text-sm mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-rounded text-lg">login</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex gap-3">
              <span className="material-symbols-rounded text-blue-600 flex-shrink-0">
                info
              </span>
              <div className="text-sm">
                <p className="font-semibold text-blue-900">Demo Credentials</p>
                <p className="text-blue-700 mt-1">
                  Contact your administrator for login credentials
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 flex-col justify-between p-12" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=1000&fit=crop')`
        }}>
      
        <div></div>

        {/* Hero Content */}
        <div className="text-white max-w-md">
          <h2 className="text-4xl font-bold mb-4">Training Excellence</h2>
          <p className="text-blue-100 text-lg mb-8">
            Streamline inductions and track employee development with our comprehensive platform.
          </p>

          {/* Feature List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-rounded text-blue-300 flex-shrink-0 mt-1">
                check_circle
              </span>
              <div>
                <p className="font-semibold text-white">Easy Session Management</p>
                <p className="text-sm text-blue-100">Create and manage training sessions effortlessly</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-rounded text-blue-300 flex-shrink-0 mt-1">
                check_circle
              </span>
              <div>
                <p className="font-semibold text-white">Track Progress</p>
                <p className="text-sm text-blue-100">Monitor trainee performance and completion rates</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="material-symbols-rounded text-blue-300 flex-shrink-0 mt-1">
                check_circle
              </span>
              <div>
                <p className="font-semibold text-white">Role-Based Access</p>
                <p className="text-sm text-blue-100">Secure permissions tailored to each user role</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="text-blue-100 text-sm">
          <p>© 2025 Adamus Resources Limited. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}