import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* -------------------- 🧩 Type Definitions -------------------- */

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  role: string;
  completedCourses?: number;
  inProgressCourses?: number;
  upcomingCourses?: number;
  status?: string;
}

interface UserResponse {
  success: boolean;
  user: User;
}

/* -------------------- 🛠️ Components -------------------- */

function UserAvatar({ name }: { name: string }) {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div className={`${color} rounded-full w-24 h-24 flex items-center justify-center text-white font-bold text-3xl shadow-md`}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { bg: string; text: string; icon: string }> = {
    superadmin: { bg: "bg-red-100", text: "text-red-700", icon: "admin_panel_settings" },
    hr: { bg: "bg-blue-100", text: "text-blue-700", icon: "group" },
    facilitator: { bg: "bg-green-100", text: "text-green-700", icon: "person_check" },
    hse: { bg: "bg-purple-100", text: "text-purple-700", icon: "safety_check" },
    trainee: { bg: "bg-cyan-100", text: "text-cyan-700", icon: "school" },
  };

  const config = roleConfig[role.toLowerCase()] || roleConfig.trainee;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className="material-symbols-rounded text-sm">{config.icon}</span>
      <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
    </div>
  );
}

function SummaryCard({ label, value, icon, color = "blue" }: { label: string; value: number; icon: string; color?: "blue" | "green" | "purple" }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <span className="material-symbols-rounded text-lg">{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function InfoField({ label, value, icon }: any) {
  return (
    <div className="pb-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <span className="material-symbols-rounded text-gray-400">{icon}</span>}
          <p className="text-sm text-gray-600">{label}</p>
        </div>
        <p className="font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}

/* -------------------- ⚙️ Main Component -------------------- */

export default function UserProfile() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      if (!id) throw new Error("Invalid user ID");
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const res = await axios.get<UserResponse>(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (!res.data.success) throw new Error("Failed to load user");
      setUser(res.data.user);
      setError(null);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || axiosErr.message || "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (user) {
      setEditForm({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        department: user.department || "",
        role: user.role,
        status: user.status || "active",
      });
      setIsEditing(true);
      setSaveError(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({});
    setSaveError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Unauthorized");

      const res = await axios.put<UserResponse>(`${API_URL}/users/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (!res.data.success) throw new Error("Failed to update user");
      setUser(res.data.user);
      setIsEditing(false);
      setEditForm({});
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setSaveError(axiosErr.response?.data?.message || axiosErr.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md w-full">
          <div className="flex items-start gap-4">
            <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-2xl">error</span>
            <div>
              <h2 className="text-xl font-bold text-red-900">Failed to Load Profile</h2>
              <p className="text-red-700 mt-2">{error}</p>
              <button
                onClick={() => navigate("/admin/users")}
                className="text-red-600 hover:text-red-800 mt-4 inline-block font-medium"
              >
                ← Back to Users
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-yellow-900">User Not Found</h2>
          <button
            onClick={() => navigate("/hr/users")}
            className="text-yellow-600 hover:text-yellow-800 mt-4 inline-block font-medium"
          >
            ← Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Employee Profile</h1>
            <p className="text-gray-600 mt-1">View and edit employee information</p>
          </div>
          <button
            onClick={() => navigate("/admin/users")}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
          >
            <span className="material-symbols-rounded">arrow_back</span>
            Back
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-8 mb-6">
            <UserAvatar name={user.name} />
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h2>
              <div className="flex gap-2 mb-3 justify-center sm:justify-start">
                <RoleBadge role={user.role} />
              </div>
              {user.department && (
                <p className="text-gray-600">
                  <span className="font-medium">{user.department}</span> Department
                </p>
              )}
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={handleEditClick}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <span className="material-symbols-rounded">edit</span>
              Edit Profile
            </button>
          )}
        </div>

        {/* Edit Mode */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <p className="text-blue-700 text-sm font-medium mb-4">📝 Edit Mode - Make changes below</p>
            {saveError && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-4">
                {saveError}
              </div>
            )}
          </div>
        )}

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <span className="material-symbols-rounded text-blue-600">person</span>
            Personal Information
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editForm.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editForm.phoneNumber || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  name="department"
                  value={editForm.department || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={editForm.role || ""}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="trainee">Trainee</option>
                  <option value="facilitator">Facilitator</option>
                  <option value="hse">HSE</option>
                  <option value="hr">HR</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={editForm.status || "active"}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <span className="material-symbols-rounded">check</span>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition"
                >
                  <span className="material-symbols-rounded">close</span>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <InfoField label="Name" value={user.name} icon="badge" />
              <InfoField label="Email Address" value={user.email} icon="email" />
              <InfoField label="Phone Number" value={user.phoneNumber || ""} icon="phone" />
              <InfoField label="Department" value={user.department || ""} icon="business" />
              <InfoField label="Role" value={user.role} icon="security" />
              <InfoField label="Status" value={user.status || "active"} icon="info" />
            </div>
          )}
        </div>

        {/* Induction Summary */}
        {!isEditing && (
          <section>
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-rounded text-green-600">school</span>
              Induction Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <SummaryCard
                label="Completed"
                value={user.completedCourses ?? 0}
                icon="done_all"
                color="green"
              />
              <SummaryCard
                label="In Progress"
                value={user.inProgressCourses ?? 0}
                icon="play_circle"
                color="blue"
              />
              <SummaryCard
                label="Upcoming"
                value={user.upcomingCourses ?? 0}
                icon="schedule"
                color="purple"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}