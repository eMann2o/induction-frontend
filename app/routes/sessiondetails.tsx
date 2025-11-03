import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import QRCode from "qrcode";
import { useParams, useNavigate } from "react-router";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;

/* ------------------------------ Interfaces ------------------------------ */

interface Trainee {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  status: string;
}

interface SessionAttempt {
  _id: string;
  trainee: {
    _id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  score: number;
  totalQuestions: number;
  status: "passed" | "failed";
  attemptNumber: number;
  submittedAt: string;
}

interface SessionData {
  id: string;
  status: "scheduled" | "active" | "completed";
  questionSetVersion: number;
  training: {
    id: string;
    title: string;
    description?: string;
    passMark: number;
  };
  facilitator: {
    _id: string;
    name: string;
    email: string;
  };
  trainees: Trainee[];
}

interface AttemptsData {
  success: boolean;
  count: number;
  attempts: SessionAttempt[];
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
  color?: "blue" | "green" | "purple" | "red";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    purple: "bg-purple-100 text-purple-700",
    red: "bg-red-100 text-red-700",
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

/* ------------------------------ Status Badge ------------------------------ */

function StatusBadge({ status }: { status: "scheduled" | "active" | "completed" }) {
  const statusConfig = {
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
      icon: "done",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className="material-symbols-rounded text-sm">{config.icon}</span>
      <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </div>
  );
}

/* ------------------------------ Trainee Avatar ------------------------------ */

function TraineeAvatar({ name }: { name: string }) {
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

/* ------------------------------ Main Component ------------------------------ */

export default function SessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [attempts, setAttempts] = useState<SessionAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire("Unauthorized", "No token found. Please log in again.", "error");
      navigate("");
      return;
    }

    if (!id) return;

    fetchSession();
  }, [id, navigate]);

  /* ----------------------- Fetch Session ----------------------- */
  const fetchSession = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (res.data.success) {
        setSession(res.data.session);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || "Failed to load session";
      setError(message);
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ----------------------- Start Session ----------------------- */
  const startSession = async () => {
    if (!session) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/sessions/${session.id}/start`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Session Started!",
        text: "Your session is now active. Trainees can join.",
        confirmButtonColor: "#2563eb",
      });
      setSession({ ...session, status: "active" });
      setTimeout(() => showQRCode(), 500);
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to start session",
        "error"
      );
    }
  };

  /* ----------------------- End Session ----------------------- */
  const endSession = async () => {
    if (!session) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const confirm = await Swal.fire({
      title: "End This Session?",
      text: "Trainees will no longer be able to join. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, end it",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.post(
        `${API_URL}/sessions/${session.id}/end`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      Swal.fire({
        icon: "success",
        title: "Session Ended",
        text: "This session has been marked as completed.",
        confirmButtonColor: "#2563eb",
      });
      setSession({ ...session, status: "completed" });
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to end session",
        "error"
      );
    }
  };

  /* ----------------------- Fetch Attempts ----------------------- */
  const fetchAttempts = async () => {
    if (!session) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoadingResults(true);
      const res = await axios.get<AttemptsData>(
        `${API_URL}/sessions/${session.id}/attempts`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      
      if (res.data.success) {
        setAttempts(res.data.attempts);
        setShowResults(true);
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to load attempts",
        "error"
      );
    } finally {
      setLoadingResults(false);
    }
  };

  /* ----------------------- Show QR Code ----------------------- */
  const showQRCode = async () => {
    if (!session) return;
    const qrUrl = `${FRONTEND_URL}/join-session/${session.id}`;

    try {
      const qrImage = await QRCode.toDataURL(qrUrl, {
        width: 300,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });

      Swal.fire({
        title: "Trainee Join QR Code",
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
            <img src="${qrImage}" alt="QR Code" style="max-width: 220px; border-radius: 8px; border: 1px solid #e5e7eb;" />
            <p style="font-size: 0.85rem; color: #666; word-break: break-all; margin: 0; max-width: 100%;">
              <strong>Join Link:</strong><br>${qrUrl}
            </p>
            <p style="font-size: 0.8rem; color: #999; margin: 0;">
              Share this QR code with trainees to join the session
            </p>
          </div>
        `,
        showConfirmButton: false,
        showDenyButton: true,
        showCancelButton: true,
        denyButtonText: "Download QR",
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isDenied) {
          const a = document.createElement("a");
          a.href = qrImage;
          a.download = `session-${session.id}-qr.png`;
          a.click();
        }
      });
    } catch (err) {
      Swal.fire("Error", "Failed to generate QR code", "error");
    }
  };

  /* ----------------------- Calculate Stats ----------------------- */
  const calculateStats = () => {
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        passed: 0,
        failed: 0,
        averageScore: 0,
        passRate: 0,
      };
    }

    const passed = attempts.filter(a => a.status === "passed").length;
    const totalScore = attempts.reduce((sum, a) => sum + a.score, 0);
    const averageScore = (totalScore / attempts.length).toFixed(1);
    const passRate = ((passed / attempts.length) * 100).toFixed(1);

    return {
      totalAttempts: attempts.length,
      passed,
      failed: attempts.length - passed,
      averageScore,
      passRate,
    };
  };

  /* ----------------------- Render States ----------------------- */

  if (error && !loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Session Details" />
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
                      Failed to Load Session
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
      <Title title="Session Details" />
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
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {[...Array(4)].map((_, i) => (
                        <th key={i} className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[...Array(3)].map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Session Details" />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
              event_busy
            </span>
            <p className="text-gray-500 mt-2">Session not found</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div>
      <AdminNavbar />
      <Title title="Session Details" />
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {session.training.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <StatusBadge status={session.status} />
                  <span className="text-gray-600">
                    {session.trainees.length} trainee{session.trainees.length !== 1 ? "s" : ""} enrolled
                  </span>
                </div>
                {session.training.description && (
                  <p className="text-gray-600 mt-2 text-sm">{session.training.description}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {session.status === "scheduled" && (
                  <button
                    onClick={startSession}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                  >
                    <span className="material-symbols-rounded">play_circle</span>
                    <span>Start Session</span>
                  </button>
                )}
                {session.status === "active" && (
                  <>
                    <button
                      onClick={showQRCode}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                      <span className="material-symbols-rounded">qr_code</span>
                      <span>Show QR</span>
                    </button>
                    <button
                      onClick={endSession}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    >
                      <span className="material-symbols-rounded">stop_circle</span>
                      <span>End Session</span>
                    </button>
                  </>
                )}
                {session.status === "completed" && !showResults && (
                  <button
                    onClick={fetchAttempts}
                    disabled={loadingResults}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-rounded">
                      {loadingResults ? "progress_activity" : "assessment"}
                    </span>
                    <span>{loadingResults ? "Loading..." : "View Results"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatsCard
                label="Total Trainees"
                value={session.trainees.length}
                icon="group"
                color="blue"
              />
              <StatsCard
                label="Pass Mark"
                value={`${session.training.passMark} questions`}
                icon="flag"
                color="purple"
              />
              {showResults && (
                <>
                  <StatsCard
                    label="Average Score"
                    value={`${stats.averageScore}%`}
                    icon="trending_up"
                    color="blue"
                  />
                  <StatsCard
                    label="Pass Rate"
                    value={`${stats.passRate}%`}
                    icon="check_circle"
                    color="green"
                  />
                </>
              )}
            </div>

            {/* Results Section */}
            {showResults && attempts.length > 0 && (
              <div className="mb-8 bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-rounded text-purple-600">
                      assessment
                    </span>
                    Session Results
                  </h2>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>

                {/* Results Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Total Attempts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stats.totalAttempts}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-green-600 uppercase tracking-wide font-medium">
                      Passed
                    </p>
                    <p className="text-3xl font-bold text-green-600 mt-2">
                      {stats.passed}
                    </p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 text-center">
                    <p className="text-xs text-red-600 uppercase tracking-wide font-medium">
                      Failed
                    </p>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                      {stats.failed}
                    </p>
                  </div>
                </div>

                {/* Results Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Trainee
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Attempt #
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900">
                          Submitted
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attempts.map((attempt) => (
                        <tr key={attempt._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <TraineeAvatar name={attempt.trainee.name} />
                              <span className="font-medium text-gray-900">
                                {attempt.trainee.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {attempt.trainee.phoneNumber || attempt.trainee.email}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-gray-900">
                              {attempt.score}/{attempt.totalQuestions}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                attempt.status === "passed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              <span className="material-symbols-rounded text-sm">
                                {attempt.status === "passed"
                                  ? "check_circle"
                                  : "cancel"}
                              </span>
                              <span>
                                {attempt.status === "passed" ? "Passed" : "Failed"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            #{attempt.attemptNumber}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {new Date(attempt.submittedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enrolled Trainees Table */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <span className="material-symbols-rounded text-blue-600">
                  group
                </span>
                Enrolled Trainees
              </h2>

              {session.trainees.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                  <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                    group_off
                  </span>
                  <p className="text-gray-500 mt-2">No trainees enrolled in this session</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">
                            Trainee
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">
                            Phone
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">
                            Department
                          </th>
                          <th className="px-6 py-4 text-left font-semibold text-gray-900">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {session.trainees.map((trainee) => (
                          <tr key={trainee._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <TraineeAvatar name={trainee.name} />
                                <span className="font-medium text-gray-900">
                                  {trainee.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {trainee.phoneNumber || "—"}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              {trainee.department || "—"}
                            </td>
                            <td className="px-6 py-4">
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                                  trainee.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                <span className="material-symbols-rounded text-sm">
                                  {trainee.status === "active" ? "check_circle" : "pause_circle"}
                                </span>
                                <span>{trainee.status}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}