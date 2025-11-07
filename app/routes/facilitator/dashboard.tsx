import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios, { type AxiosResponse } from "axios";
import Swal from "sweetalert2";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ----------------------------- Type Definitions ----------------------------- */
interface Session {
  id: string;
  trainingTitle: string;
  traineeCount: number;
  status: string;
  createdAt: string;
}

/* ----------------------------- Skeleton Components ----------------------------- */

function SkeletonRow() {
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

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
}

function StatsCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: number;
  icon: string;
  color?: "blue" | "green" | "purple" | "orange";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-600">{label}</h3>
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <span className="material-symbols-rounded text-lg">{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function SessionAvatar({ title }: { title: string }) {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
  ];
  const color = colors[title.charCodeAt(0) % colors.length];

  return (
    <div className={`${color} rounded-lg w-10 h-10 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
      {title?.charAt(0).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isFuture = status !== "completed";
  const isActive = status === "active";

  if (isFuture) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}>
        <span className="material-symbols-rounded text-sm">
          {isActive ? "play_circle" : "schedule"}
        </span>
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
      <span className="material-symbols-rounded text-sm">done</span>
      <span>Completed</span>
    </div>
  );
}

/* ----------------------------- Main Component ----------------------------- */

export default function FacilitatorDashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);
  const rowsPerPage = 10;

  /* ----------------------------- Fetch Sessions ----------------------------- */
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("No authentication token found");
        }

        const res: AxiosResponse<{ sessions: Session[] }> = await axios.get(
          `${API_URL}/sessions`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setSessions(res.data.sessions || []);
      } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Failed to load sessions";
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

    fetchSessions();
  }, []);

  /* ----------------------------- Derived Lists ----------------------------- */
  const upcomingSessions = sessions.filter((s) => s.status !== "completed");
  const pastSessions = sessions.filter((s) => s.status === "completed");

  const paginate = (array: Session[], page: number) =>
    array.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* ----------------------------- Handle View ----------------------------- */
  const handleView = (id: string, title: string) => {
    Swal.fire({
      title: "Opening Session",
      text: `Viewing analytics for "${title}"`,
      icon: "info",
      timer: 1200,
      showConfirmButton: false,
      confirmButtonColor: "#2563eb",
    });

    setTimeout(() => {
      navigate(`/facilitator/session/${id}`);
    }, 1200);
  };

  /* ----------------------------- Pagination Component ----------------------------- */
  const Pagination = ({
    currentPage,
    totalItems,
    onPageChange,
  }: {
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  }) => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-rounded">chevron_left</span>
        </button>

        <div className="flex items-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-600 text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span className="material-symbols-rounded">chevron_right</span>
        </button>
      </div>
    );
  };

  /* ----------------------------- Render ----------------------------- */

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
                    <h2 className="text-xl font-bold text-red-900">Failed to Load Sessions</h2>
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

  return (
    <div>
      <AdminNavbar />
      <Title title="Dashboard" />
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Facilitator Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and monitor induction sessions</p>
            </div>

            {/* Stats Cards */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatsCard
                  label="Upcoming Sessions"
                  value={upcomingSessions.length}
                  icon="schedule"
                  color="blue"
                />
                <StatsCard
                  label="Active Sessions"
                  value={sessions.filter((s) => s.status === "active").length}
                  icon="play_circle"
                  color="green"
                />
                <StatsCard
                  label="Completed Sessions"
                  value={pastSessions.length}
                  icon="done_all"
                  color="purple"
                />
              </div>
            )}

            {/* Upcoming Sessions Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-600">schedule</span>
                Upcoming Sessions
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : upcomingSessions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                  <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                    event_busy
                  </span>
                  <p className="text-gray-500 mt-2">No upcoming sessions scheduled</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Session
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Trainees
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Status
                            </th>
                            <th className="px-6 py-4 text-right font-semibold text-gray-900">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginate(upcomingSessions, upcomingPage).map((s) => (
                            <tr
                              key={s.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <SessionAvatar title={s.trainingTitle} />
                                  <span className="font-medium text-gray-900">
                                    {s.trainingTitle || "Untitled"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {new Date(s.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  {s.traineeCount}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={s.status} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-auto hover:underline"
                                  onClick={() => handleView(s.id, s.trainingTitle)}
                                >
                                  <span>View</span>
                                  <span className="material-symbols-rounded text-lg">
                                    arrow_forward
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Pagination
                    currentPage={upcomingPage}
                    totalItems={upcomingSessions.length}
                    onPageChange={setUpcomingPage}
                  />
                </>
              )}
            </section>

            {/* Past Sessions Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-rounded text-purple-600">done_all</span>
                Past Sessions
              </h2>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : pastSessions.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                  <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                    event_busy
                  </span>
                  <p className="text-gray-500 mt-2">No completed sessions yet</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Session
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Trainees
                            </th>
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">
                              Status
                            </th>
                            <th className="px-6 py-4 text-right font-semibold text-gray-900">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {paginate(pastSessions, pastPage).map((s) => (
                            <tr
                              key={s.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <SessionAvatar title={s.trainingTitle} />
                                  <span className="font-medium text-gray-900">
                                    {s.trainingTitle || "Untitled"}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-gray-600">
                                {new Date(s.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                  {s.traineeCount}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={s.status} />
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-auto hover:underline"
                                  onClick={() => handleView(s.id, s.trainingTitle)}
                                >
                                  <span>View</span>
                                  <span className="material-symbols-rounded text-lg">
                                    arrow_forward
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <Pagination
                    currentPage={pastPage}
                    totalItems={pastSessions.length}
                    onPageChange={setPastPage}
                  />
                </>
              )}
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}