import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import type { AxiosResponse } from "axios";
import Swal from "sweetalert2";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ------------------------- 🧩 Type Definitions ------------------------- */
interface Session {
  id: string;
  trainingTitle: string;
  facilitator: string;
  traineeCount: number;
  status: string;
  createdAt: string;
}

interface SessionsResponse {
  success: boolean;
  count: number;
  sessions: Session[];
}

/* ------------------------------ 🛠️ Components ------------------------------ */

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-200">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
        </td>
      ))}
    </tr>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { bg: string; text: string; icon: string }
  > = {
    scheduled: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: "schedule",
    },
    active: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: "play_circle",
    },
    completed: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: "check_circle",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "cancel",
    },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.scheduled;

  return (
    <div className={`${config.bg} ${config.text} inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium`}>
      <span className="material-symbols-rounded text-sm">{config.icon}</span>
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
}

function SessionCard({ session, formatDate }: { session: Session; formatDate: (date: string) => string }) {
  return (
    <Link to={`/session/${session.id}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {session.trainingTitle || "Untitled Induction"}
            </h3>
            <p className="text-sm text-gray-600">
              Facilitator: <span className="font-medium">{session.facilitator || "N/A"}</span>
            </p>
          </div>
          <StatusBadge status={session.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Trainees</p>
            <p className="text-2xl font-bold text-gray-900">{session.traineeCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
            <p className="text-sm font-medium text-gray-700">{formatDate(session.createdAt)}</p>
          </div>
        </div>

        <button className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-rounded text-lg">arrow_forward</span>
          View Details
        </button>
      </div>
    </Link>
  );
}

/* ----------------------- ⚙️ Main Component ----------------------- */
export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [error, setError] = useState<string | null>(null);

  /* ------------------------- 🔍 Fetch Sessions ------------------------- */
  const fetchSessions = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response: AxiosResponse<SessionsResponse> = await axios.get(
        `${API_URL}/sessions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (response.data.success) {
        setSessions(response.data.sessions || []);
        setTotalPages(Math.ceil((response.data.count || 0) / 10) || 1);
      } else {
        throw new Error("Failed to load sessions");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to load sessions";
      setError(errorMsg);
      console.error("❌ Error fetching sessions:", error);

      Swal.fire({
        title: "Error",
        text: errorMsg,
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page]);

  /* ------------------------- 📊 Format Date ------------------------- */
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  /* ----------------------- 🎨 JSX ----------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title="Sessions" />
      <div className="relative flex min-h-screen w-full flex-col bg-gray-50">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="w-full max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Induction Sessions</h1>
                <p className="text-gray-600 mt-1">Manage and view all induction sessions</p>
              </div>
              <Link to="/create-session" className="flex items-center">
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                  <span className="material-symbols-rounded">add</span>
                  <span>New Session</span>
                </button>
              </Link>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Total Sessions
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{sessions.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Active Now
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {sessions.filter((s) => s.status === "active").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Total Trainees
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {sessions.reduce((sum, s) => sum + s.traineeCount, 0)}
                </p>
              </div>
            </div>

            {/* View Toggle */}
            {sessions.length > 0 && (
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "table"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="material-symbols-rounded inline mr-1">view_week</span>
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === "grid"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="material-symbols-rounded inline mr-1">view_comfy</span>
                    Grid
                  </button>
                </div>

                {sessions.length > 0 && (
                  <span className="text-sm text-gray-600">
                    Showing page <span className="font-semibold">{page}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </span>
                )}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-rounded text-red-600 flex-shrink-0 mt-0.5">
                    error
                  </span>
                  <div>
                    <h3 className="font-semibold text-red-900">Failed to Load Sessions</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Table View */}
            {viewMode === "table" && (
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
                          Created
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                      ) : sessions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center">
                            <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                              event_busy
                            </span>
                            <p className="text-gray-500 mt-2">No sessions found</p>
                          </td>
                        </tr>
                      ) : (
                        sessions.map((session) => (
                          <tr
                            key={session.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {session.trainingTitle || "Untitled"}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {session.facilitator || "N/A"}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                {session.traineeCount}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={session.status} />
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {formatDate(session.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link to={`/session/${session.id}`}>
                                <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 ml-auto">
                                  <span>View</span>
                                  <span className="material-symbols-rounded text-lg">
                                    arrow_forward
                                  </span>
                                </button>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse"
                      >
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                      event_busy
                    </span>
                    <p className="text-gray-500 mt-2">No sessions found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {sessions.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                >
                  <span className="material-symbols-rounded">chevron_left</span>
                </button>

                <div className="flex items-center gap-3">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        page === p
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                >
                  <span className="material-symbols-rounded">chevron_right</span>
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}