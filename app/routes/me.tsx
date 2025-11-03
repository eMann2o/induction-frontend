import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ------------------------------ Interfaces ------------------------------ */

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  role: "trainee" | "facilitator" | "hr" | "hse" | "superadmin";
  status: "active" | "inactive";
}

interface TraineeStats {
  passRate: number;
  averageScore: number;
  totalAttempts: number;
  passedAttempts: number;
  failedAttempts: number;
  bestScore: number;
  worstScore: number;
  trainingsCompleted: number;
  recentAttempts?: Array<{
    training: string;
    score: number;
    totalQuestions: number;
    status: "passed" | "failed";
    attemptNumber: number;
    submittedAt: string;
  }>;
}

interface FacilitatorStats {
  totalSessions: number;
  totalTraineesTaught: number;
  averagePassRate: number;
  completedSessions: number;
  activeSessions: number;
  totalAttempts: number;
  recentSessions?: Array<{
    training: string;
    traineeCount: number;
    status: "completed" | "active";
  }>;
}

interface AdminStats {
  totalTrainings: number;
  totalSessions: number;
  systemStats: {
    totalUsers: number;
    totalTrainees: number;
    totalFacilitators: number;
    activeSessions: number;
  };
}

interface ProfileData {
  success: boolean;
  user: User;
  stats: TraineeStats | FacilitatorStats | AdminStats;
}

/* ------------------------------ Skeleton Components ------------------------------ */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded w-24"></div>
    </div>
  );
}

/* ------------------------------ Stats Card ------------------------------ */

function StatsCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: "blue" | "green" | "yellow" | "orange" | "purple" | "gray";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    orange: "bg-orange-100 text-orange-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <span className="material-symbols-rounded text-lg">{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* ------------------------------ Metric Row ------------------------------ */

function MetricRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string | number;
  status?: "passed" | "failed" | "active";
}) {
  let statusColor = "";
  let statusIcon = "";

  if (status === "passed") {
    statusColor = "bg-green-50 border-green-200";
    statusIcon = "✓";
  } else if (status === "failed") {
    statusColor = "bg-red-50 border-red-200";
    statusIcon = "✗";
  } else if (status === "active") {
    statusColor = "bg-blue-50 border-blue-200";
    statusIcon = "◆";
  }

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${statusColor || "bg-gray-50 border-gray-200"}`}>
      <p className="text-sm text-gray-700 font-medium">{label}</p>
      <div className="flex items-center gap-2">
        {statusIcon && (
          <span
            className={`text-sm font-semibold ${
              status === "passed"
                ? "text-green-600"
                : status === "failed"
                  ? "text-red-600"
                  : "text-blue-600"
            }`}
          >
            {statusIcon}
          </span>
        )}
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------ System Stat Item ------------------------------ */

function SystemStatItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* ------------------------------ Main Component ------------------------------ */

export default function ProfileStats() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    department: "",
    password: "",
    confirmPassword: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Unauthorized", "No token found. Please log in again.", "error");
      navigate("");
      return;
    }

    fetchProfileStats();
  }, [navigate]);

  useEffect(() => {
    if (isEditing) {
      setTimeout(() => setShowModal(true), 10);
    } else {
      setShowModal(false);
    }
  }, [isEditing]);

  const fetchProfileStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get<ProfileData>(`${API_URL}/profile/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (res.data.success) {
        setProfile(res.data);
        setEditData({
          name: res.data.user.name,
          email: res.data.user.email || "",
          phoneNumber: res.data.user.phoneNumber || "",
          department: res.data.user.department || "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load profile";
      setError(message);
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    // Validation
    if (!editData.name.trim()) {
      Swal.fire("Error", "Name is required", "error");
      return;
    }

    if (profile.user.role !== "trainee" && !editData.email.trim()) {
      Swal.fire("Error", "Email is required", "error");
      return;
    }

    if (editData.password && editData.password !== editData.confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setSavingProfile(true);

      const updatePayload: any = {
        name: editData.name,
      };

      if (profile.user.role !== "trainee") {
        updatePayload.email = editData.email;
      } else {
        if (editData.phoneNumber.trim()) {
          updatePayload.phoneNumber = editData.phoneNumber;
        }
        if (editData.department.trim()) {
          updatePayload.department = editData.department;
        }
      }

      if (editData.password.trim()) {
        updatePayload.password = editData.password;
      }

      const res = await axios.put(
        `${API_URL}/me/edit`,
        updatePayload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        setProfile({
          ...profile,
          user: res.data.user,
        });
        setEditData((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
        }));
        setIsEditing(false);
        Swal.fire({
          icon: "success",
          title: "Profile Updated",
          text: "Your profile has been updated successfully.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to update profile";
      Swal.fire("Error", message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

  if (error && !loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Profile" />
        <div className="bg-gray-50 min-h-screen">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-2xl">
                    error
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-red-900">
                      Failed to Load Profile
                    </h2>
                    <p className="text-red-700 mt-2">{error}</p>
                    <button
                      onClick={() => window.history.back()}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Profile" />
        <div className="bg-gray-50 min-h-screen">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="h-10 bg-gray-200 rounded w-64 animate-pulse mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Profile" />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
              person_off
            </span>
            <p className="text-gray-500 mt-2">Profile not found</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { user, stats } = profile;

  const getProfileStats = () => {
    if (user.role === "trainee") {
      const traineeStats = stats as TraineeStats;
      return [
        { label: "Pass Rate", value: `${traineeStats.passRate}%`, icon: "trending_up", color: "green" as const },
        { label: "Avg Score", value: traineeStats.averageScore, icon: "grade", color: "yellow" as const },
        { label: "Total Attempts", value: traineeStats.totalAttempts, icon: "assignment", color: "blue" as const },
      ];
    }

    if (user.role === "facilitator") {
      const facStats = stats as FacilitatorStats;
      return [
        { label: "Total Sessions", value: facStats.totalSessions, icon: "school", color: "blue" as const },
        { label: "Trainees Taught", value: facStats.totalTraineesTaught, icon: "group", color: "green" as const },
        { label: "Pass Rate", value: `${facStats.averagePassRate}%`, icon: "trending_up", color: "orange" as const },
      ];
    }

    const adminStats = stats as AdminStats;
    return [
      { label: "Total Users", value: adminStats.systemStats.totalUsers, icon: "group", color: "blue" as const },
      { label: "Trainings", value: adminStats.totalTrainings, icon: "book", color: "purple" as const },
      { label: "Sessions", value: adminStats.totalSessions, icon: "event", color: "green" as const },
    ];
  };

  return (
    <div>
      <AdminNavbar />
      <Title title="Profile" />
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-current"></span>
                    {user.status === "active" ? "Active" : "Inactive"}
                  </span>
                  <span className="text-gray-600 capitalize text-sm">
                    {user.role === "superadmin" ? "Super Admin" : user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {user.email && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-rounded text-gray-400">mail</span>
                    <p className="text-xs font-medium text-gray-600">Email</p>
                  </div>
                  <p className="text-gray-900 font-medium truncate">{user.email}</p>
                </div>
              )}
              {user.phoneNumber && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-rounded text-gray-400">phone</span>
                    <p className="text-xs font-medium text-gray-600">Phone</p>
                  </div>
                  <p className="text-gray-900 font-medium">{user.phoneNumber}</p>
                </div>
              )}
              {user.department && (
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-rounded text-gray-400">business</span>
                    <p className="text-xs font-medium text-gray-600">Department</p>
                  </div>
                  <p className="text-gray-900 font-medium">{user.department}</p>
                </div>
              )}
            </div>

            {/* Edit Profile Button */}
            <div className="mb-8">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                <span className="material-symbols-rounded">edit</span>
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Edit Profile Modal */}
            {isEditing && (
              <>
                <div className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-out ${
                  showModal ? 'bg-opacity-50' : 'bg-opacity-0'
                }`} onClick={() => setIsEditing(false)} />
                <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none transition-opacity duration-300 ease-out ${
                  showModal ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className={`bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl pointer-events-auto transform transition-all duration-300 ease-out ${
                    showModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                  }`}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

                    <div className="space-y-4">
                      {/* Name */}
                      <div className="transform transition-all duration-300 delay-75">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editData.name}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Your name"
                        />
                      </div>

                      {/* Email - Only for non-trainees */}
                      {user.role !== "trainee" && (
                        <div className="transform transition-all duration-300 delay-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={editData.email}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="your@email.com"
                          />
                        </div>
                      )}

                      {/* Phone Number - Only for trainees */}
                      {user.role === "trainee" && (
                        <div className="transform transition-all duration-300 delay-100">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={editData.phoneNumber}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Phone number"
                          />
                        </div>
                      )}

                      {/* Department - Only for trainees */}
                      {user.role === "trainee" && (
                        <div className="transform transition-all duration-300 delay-125">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Department
                          </label>
                          <input
                            type="text"
                            name="department"
                            value={editData.department}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Department"
                          />
                        </div>
                      )}

                      {/* Password */}
                      <div className="transform transition-all duration-300 delay-150">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Password (Optional)
                        </label>
                        <input
                          type="password"
                          name="password"
                          value={editData.password}
                          onChange={handleEditInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          placeholder="Leave blank to keep current password"
                        />
                      </div>

                      {/* Confirm Password */}
                      {editData.password && (
                        <div className="transform transition-all duration-300 origin-top">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={editData.confirmPassword}
                            onChange={handleEditInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Confirm new password"
                          />
                        </div>
                      )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mt-8 transform transition-all duration-300 delay-200">
                      <button
                        onClick={() => setIsEditing(false)}
                        disabled={savingProfile}
                        className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {savingProfile ? (
                          <>
                            <span className="material-symbols-rounded animate-spin">
                              progress_activity
                            </span>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <span className="material-symbols-rounded">check</span>
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {getProfileStats().map((stat, idx) => (
                <StatsCard key={idx} {...stat} />
              ))}
            </div>

            {/* Role-Specific Details */}
            {user.role === "trainee" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-rounded text-purple-600">
                      assessment
                    </span>
                    Performance Metrics
                  </h2>
                  <div className="space-y-3">
                    <MetricRow label="Total Attempts" value={(stats as TraineeStats).totalAttempts} />
                    <MetricRow label="Passed" value={(stats as TraineeStats).passedAttempts} status="passed" />
                    <MetricRow label="Failed" value={(stats as TraineeStats).failedAttempts} status="failed" />
                    <MetricRow label="Best Score" value={(stats as TraineeStats).bestScore} />
                    <MetricRow label="Worst Score" value={(stats as TraineeStats).worstScore} />
                    <MetricRow label="Trainings Completed" value={(stats as TraineeStats).trainingsCompleted} />
                  </div>
                </div>

                {/* Recent Attempts */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-rounded text-green-600">
                      trending_up
                    </span>
                    Recent Attempts
                  </h2>
                  <div className="space-y-3">
                    {(stats as TraineeStats).recentAttempts?.length ? (
                      (stats as TraineeStats).recentAttempts!.map((attempt, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {attempt.training}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Attempt #{attempt.attemptNumber}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <div
                                className={`text-sm font-bold ${
                                  attempt.status === "passed"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {attempt.score}/{attempt.totalQuestions}
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mt-1 ${
                                  attempt.status === "passed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {attempt.status === "passed" ? "✓ Passed" : "✗ Failed"}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(attempt.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">No attempts yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {user.role === "facilitator" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Session Summary */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-600">
                      school
                    </span>
                    Session Summary
                  </h2>
                  <div className="space-y-3">
                    <MetricRow label="Total Sessions" value={(stats as FacilitatorStats).totalSessions} />
                    <MetricRow label="Completed" value={(stats as FacilitatorStats).completedSessions} status="passed" />
                    <MetricRow label="Active" value={(stats as FacilitatorStats).activeSessions} status="active" />
                    <MetricRow label="Total Attempts" value={(stats as FacilitatorStats).totalAttempts} />
                  </div>
                </div>

                {/* Recent Sessions */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Sessions</h2>
                  <div className="space-y-3">
                    {(stats as FacilitatorStats).recentSessions?.length ? (
                      (stats as FacilitatorStats).recentSessions!.map((session, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 p-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {session.training}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {session.traineeCount} trainees
                              </p>
                            </div>
                            <span
                              className={`px-2.5 py-1.5 rounded-full text-xs font-medium ${
                                session.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {session.status.charAt(0).toUpperCase() +
                                session.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">No sessions yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {["hr", "hse", "superadmin"].includes(user.role) && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">System Overview</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SystemStatItem
                    label="Total Users"
                    value={(stats as AdminStats).systemStats.totalUsers}
                  />
                  <SystemStatItem
                    label="Trainees"
                    value={(stats as AdminStats).systemStats.totalTrainees}
                  />
                  <SystemStatItem
                    label="Facilitators"
                    value={(stats as AdminStats).systemStats.totalFacilitators}
                  />
                  <SystemStatItem
                    label="Active Sessions"
                    value={(stats as AdminStats).systemStats.activeSessions}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}