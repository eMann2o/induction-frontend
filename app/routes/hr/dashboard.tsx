import { useEffect, useState } from "react";
import axios from "axios";
import type { AxiosResponse } from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

const API_URL = "http://localhost:3000";

/* -------------------------------------------------------------------------- */
/* 🧩 Type Definitions */
/* -------------------------------------------------------------------------- */
interface User {
  id: string;
  name: string;
  email: string;
  department: string;
  role: "trainee" | "facilitator" | "hr" | "hse" | "superadmin";
  status: "active" | "inactive";
}

interface Session {
  id: string;
  trainingTitle: string;
  facilitator: string;
  traineeCount: number;
  status: string;
  createdAt: string;
}

interface DashboardStats {
  trainees: number;
  facilitators: number;
  sessions: number;
}

/* -------------------------------------------------------------------------- */
/* 🛠️ Skeleton Components */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-20 mb-3"></div>
      <div className="h-10 bg-gray-200 rounded w-16"></div>
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-200">
      {[...Array(4)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
}

function SkeletonSessionRow() {
  return (
    <tr className="border-b border-gray-200">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* 📊 Stats Card Component */
/* -------------------------------------------------------------------------- */

function StatsCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: "blue" | "green" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <span className="material-symbols-rounded text-lg">{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 👤 User Avatar Component */
/* -------------------------------------------------------------------------- */

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
    <div className={`${color} rounded-full w-9 h-9 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🏷️ Status Badge Component */
/* -------------------------------------------------------------------------- */

function StatusBadge({ status }: { status?: string }) {
  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: "check_circle",
    },
    inactive: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: "cancel",
    },
    completed: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: "done",
    },
    scheduled: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "schedule",
    },
  };

  const normalizedStatus = (status || "inactive").toLowerCase();
  const config = statusConfig[normalizedStatus] || statusConfig.inactive;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className="material-symbols-rounded text-sm">{config.icon}</span>
      <span className="capitalize">{status || "Inactive"}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧭 HR Dashboard Component */
/* -------------------------------------------------------------------------- */

export default function HRDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    trainees: 0,
    facilitators: 0,
    sessions: 0,
  });
  const [trainees, setTrainees] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  /* 📊 Fetch HR Overview */
  useEffect(() => {
    const fetchHRData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token found");

        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, sessionsRes]: [
          AxiosResponse<{ users: User[] }>,
          AxiosResponse<{ sessions: Session[] }>
        ] = await Promise.all([
          axios.get(`${API_URL}/users`, { headers, withCredentials: true }),
          axios.get(`${API_URL}/sessions`, {
            headers,
            withCredentials: true,
          }),
        ]);

        const users = usersRes.data.users;
        const traineesData = users.filter((u) => u.role === "trainee");
        const facilitatorsData = users.filter((u) => u.role === "facilitator");

        setStats({
          trainees: traineesData.length,
          facilitators: facilitatorsData.length,
          sessions: sessionsRes.data.sessions?.length ?? 0,
        });

        setTrainees(traineesData.slice(0, 5));
        setSessions(sessionsRes.data.sessions?.slice(0, 5) ?? []);
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || "Failed to load dashboard";
        setError(message);
        Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          confirmButtonColor: "#2563eb",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHRData();
  }, []);

  /* ❌ Error State */
  if (error && !loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Dashboard" />
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
                      Failed to Load Dashboard
                    </h2>
                    <p className="text-red-700 mt-2">{error}</p>
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

  /* 📊 Main Render */
  return (
    <div>
      <AdminNavbar />
      <Title title="Dashboard" />
      <main className="flex-1 bg-gray-50 min-h-screen py-20 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">HR Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Overview of trainees, facilitators, and training sessions
            </p>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatsCard
                label="Total Trainees"
                value={stats.trainees}
                icon="group"
                color="blue"
              />
              <StatsCard
                label="Total Facilitators"
                value={stats.facilitators}
                icon="school"
                color="green"
              />
              <StatsCard
                label="Total Sessions"
                value={stats.sessions}
                icon="event"
                color="purple"
              />
            </div>
          )}

          {/* Recent Trainees Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-600">
                  group
                </span>
                Recent Trainees
              </h2>
              <Link
                to="/hr/users"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-rounded">arrow_forward</span>
                <span>Manage All</span>
              </Link>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonTableRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : trainees.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Email
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {trainees.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={t.name} />
                              <span className="font-medium text-gray-900">
                                {t.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {t.department || "—"}
                          </td>
                          <td className="px-6 py-4 text-gray-600 truncate">
                            {t.email}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={t.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                  group_off
                </span>
                <p className="text-gray-500 mt-2">No trainees found</p>
              </div>
            )}
          </section>

          {/* Recent Sessions Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="material-symbols-rounded text-purple-600">
                  event
                </span>
                Recent Sessions
              </h2>
              <Link
                to="/hr/sessions"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <span className="material-symbols-rounded">arrow_forward</span>
                <span>View All</span>
              </Link>
            </div>

            {loading ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Induction
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Facilitator
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Trainees
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonSessionRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            ) : sessions.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Induction
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Facilitator
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Trainees
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sessions.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {s.trainingTitle || "Untitled"}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {s.facilitator || "—"}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {s.traineeCount}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={s.status} />
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {new Date(s.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                  event_busy
                </span>
                <p className="text-gray-500 mt-2">No sessions found</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}