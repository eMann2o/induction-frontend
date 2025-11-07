import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

type User = {
  _id: string;
  name: string;
  email?: string;
  department?: string;
  phoneNumber?: string;
  role?: string;
  status?: "active" | "inactive";
};


type Training = {
  id?: string;
  _id?: string;
  title: string;
  description?: string;
  passMark?: number;
  currentVersion?: number;
};

/* ------------------------------ Skeleton Components ------------------------------ */

function SkeletonInput() {
  return <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>;
}

function SkeletonTraineeCard() {
  return (
    <div className="p-3 border border-gray-200 rounded-lg bg-white animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ Trainee Card Component ------------------------------ */

function TraineeCard({
  trainee,
  isSelected,
  onToggle,
}: {
  trainee: User;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`flex flex-col gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
      onClick={() => onToggle()}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
          {trainee.name?.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{trainee.name}</p>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
          {trainee.department && (
            <p className="text-xs text-gray-600 mt-1">{trainee.department}</p>
          )}
          {trainee.email && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{trainee.email}</p>
          )}
        </div>
      </div>
    </label>
  );
}

/* ------------------------------ Main Component ------------------------------ */

export default function CreateSession(): JSX.Element {
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState<string>("");
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("");
  const [selectedFacilitatorId, setSelectedFacilitatorId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");

  // Fetched lists
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [facilitators, setFacilitators] = useState<User[]>([]);
  const [trainees, setTrainees] = useState<User[]>([]);

  // Trainee selection + search
  const [query, setQuery] = useState<string>("");
  const [selectedTraineeIds, setSelectedTraineeIds] = useState<Set<string>>(
    new Set()
  );

  // UI state
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [lastSessionId, setLastSessionId] = useState<string | null>(null);

  useEffect(() => {
    void loadInitial();
  }, []);

  async function loadInitial() {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token") ?? "";

      const [tRes, uRes] = await Promise.all([
        axios.get<{ success: boolean; trainings: Training[] }>(
          `${API_URL}/trainings`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        ),
        axios.get<{ success: boolean; users: User[] }>(
          `${API_URL}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        ),
      ]);

      if (tRes.data?.success) {
        setTrainings(tRes.data.trainings ?? []);
      }

      if (uRes.data?.success) {
        const allUsers = uRes.data.users ?? [];
        setFacilitators(allUsers.filter((u) => u.role === "facilitator"));
        setTrainees(allUsers.filter((u) => u.role === "trainee" && u.status === "active"));
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ??
        err.message ??
        "Failed to load data";
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const visibleTrainees = trainees.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.name?.toLowerCase().includes(q) ||
      (t.department ?? "").toLowerCase().includes(q) ||
      (t.email ?? "").toLowerCase().includes(q)
    );
  });

  function toggleTrainee(id: string) {
    setSelectedTraineeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function isSelected(id: string) {
    return selectedTraineeIds.has(id);
  }

  const getTrainingTitle = (id: string) => {
    const t = trainings.find((tr) => tr._id === id || tr.id === id);
    return t?.title ?? "";
  };

  const getFacilitatorName = (id: string) => {
    const f = facilitators.find((x) => x._id === id);
    return f?.name ?? "";
  };

  const handleCreate = async () => {
    if (!selectedTrainingId) {
      Swal.fire(
        "Missing field",
        "Select an induction.",
        "warning"
      );
      return;
    }
    if (!selectedFacilitatorId) {
      Swal.fire(
        "Missing field",
        "Select a facilitator.",
        "warning"
      );
      return;
    }

    if (selectedTraineeIds.size === 0) {
      const confirm = await Swal.fire({
        title: "No trainees selected",
        text: "Do you want to create the session without trainees?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        confirmButtonText: "Create without trainees",
        cancelButtonText: "Cancel",
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token") ?? "";
      const body = {
        trainingId: selectedTrainingId,
        facilitatorId: selectedFacilitatorId,
        traineeIds: Array.from(selectedTraineeIds),
      };

      const res = await axios.post(`${API_URL}/sessions`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data?.success) {
        const sessionId: string | undefined =
          res.data?.session?.id ??
          res.data?.session?._id ??
          res.data?.session;
        setLastSessionId(sessionId ?? null);

        const facilitatorId = selectedFacilitatorId;
        const link = `${window.location.origin}/sessions/${sessionId}?facilitator=${encodeURIComponent(facilitatorId)}`;
        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;

        setQrUrl(qr);

        await Swal.fire({
          title: "✓ Session Created",
          html: `
            <div style="text-align: left;">
              <p style="margin: 0 0 12px 0; color: #555;">Session has been created successfully.</p>
              <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin: 12px 0;">
                <p style="margin: 0; font-size: 0.9rem; color: #666;">
                  <strong>Facilitator:</strong> ${escapeHtml(getFacilitatorName(facilitatorId))}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #666;">
                  <strong>Induction:</strong> ${escapeHtml(getTrainingTitle(selectedTrainingId))}
                </p>
                <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #666;">
                  <strong>Trainees:</strong> ${selectedTraineeIds.size} selected
                </p>
              </div>
              <div style="margin: 16px 0; text-align: center;">
                <img src="${qr}" alt="QR code" style="max-width: 220px; border-radius: 8px; border: 1px solid #e5e7eb;"/>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 0.85rem; color: #888;">Share this QR code with the facilitator to access the session</p>
            </div>
          `,
          showCancelButton: true,
          showConfirmButton: true,
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Go to Sessions",
          cancelButtonText: "Close",
        });
      } else {
        Swal.fire(
          "Error",
          res.data?.message ?? "Failed to create session",
          "error"
        );
      }
    } catch (err: any) {
      Swal.fire(
        "Error",
        err?.response?.data?.message ?? err.message ?? "Server error",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!lastSessionId || !selectedFacilitatorId) return;
    const link = `${window.location.origin}/sessions/${lastSessionId}?facilitator=${encodeURIComponent(selectedFacilitatorId)}`;
    await navigator.clipboard.writeText(link);
    Swal.fire({
      title: "Copied!",
      text: "Access link copied to clipboard",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleDownloadQr = () => {
    if (!qrUrl) return;
    window.open(qrUrl, "_blank");
  };

  if (error && !loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Create Session" />
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
                      Failed to Load Form
                    </h2>
                    <p className="text-red-700 mt-2">{error}</p>
                    <button
                      onClick={() => { setError(null); void loadInitial(); }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Retry
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

  return (
    <div>
      <AdminNavbar />
      <Title title="Create Session" />
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">
                Create Induction Session
              </h1>
              <p className="mt-2 text-gray-600">
                Set up a new session and assign trainees
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Main Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-8">
                  {/* Session Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Session Title
                    </label>
                    {loading ? (
                      <SkeletonInput />
                    ) : (
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="e.g., Q3 Product Update Induction"
                        type="text"
                      />
                    )}
                  </div>

                  {/* Induction & Facilitator Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Induction Program
                      </label>
                      {loading ? (
                        <SkeletonInput />
                      ) : (
                        <select
                          value={selectedTrainingId}
                          onChange={(e) => setSelectedTrainingId(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select a program</option>
                          {trainings.map((tr) => (
                            <option key={tr._id ?? tr.id} value={tr._id ?? tr.id}>
                              {tr.title}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Facilitator
                      </label>
                      {loading ? (
                        <SkeletonInput />
                      ) : (
                        <select
                          value={selectedFacilitatorId}
                          onChange={(e) => setSelectedFacilitatorId(e.target.value)}
                          className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                          <option value="">Select a facilitator</option>
                          {facilitators.map((f) => (
                            <option key={f._id} value={f._id}>
                              {f.name}
                              {f.department ? ` — ${f.department}` : ""}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Start Date (Optional)
                    </label>
                    {loading ? (
                      <SkeletonInput />
                    ) : (
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    )}
                  </div>

                  {/* Trainee Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">
                          Select Trainees
                        </label>
                        <p className="text-xs text-gray-600">
                          {selectedTraineeIds.size} trainee
                          {selectedTraineeIds.size !== 1 ? "s" : ""} selected
                        </p>
                      </div>
                      {!loading && (
                        <div className="relative">
                          <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                            search
                          </span>
                          <input
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Search by name, dept..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>
                      )}
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[...Array(6)].map((_, i) => (
                          <SkeletonTraineeCard key={i} />
                        ))}
                      </div>
                    ) : visibleTrainees.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg py-12 text-center">
                        <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                          group_off
                        </span>
                        <p className="text-gray-500 mt-2">
                          {query
                            ? "No trainees match your search"
                            : "No trainees available"}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pr-2">
                        {visibleTrainees.map((t) => (
                          <TraineeCard
                            key={t._id}
                            trainee={t}
                            isSelected={isSelected(t._id)}
                            onToggle={() => toggleTrainee(t._id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(-1)}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={loading || submitting}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Creating...
                        </>
                      ) : (
                        <>
                          <span>Create Session</span>
                          <span className="material-symbols-rounded text-lg">
                            arrow_forward
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar - QR & Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* QR Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Session Access
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    After creation, a QR code will appear here for facilitator access.
                  </p>

                  <div className="flex flex-col items-center gap-4">
                    {qrUrl ? (
                      <>
                        <img
                          src={qrUrl}
                          alt="Session QR"
                          className="rounded-lg border border-gray-200 p-2 bg-white w-full max-w-[180px]"
                        />
                        <p className="text-xs text-gray-500 text-center">
                          Scan to access session
                        </p>
                        <div className="flex flex-col gap-2 w-full">
                          <button
                            onClick={handleCopyLink}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-rounded text-lg">
                              content_copy
                            </span>
                            Copy Link
                          </button>
                          <button
                            onClick={handleDownloadQr}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-rounded text-lg">
                              download
                            </span>
                            Download
                          </button>
                          <button
                            onClick={() => navigate("/admin/sessions")}
                            className="w-full px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <span className="material-symbols-rounded text-lg">
                              arrow_forward
                            </span>
                            All Sessions
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="w-full aspect-square rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-rounded text-4xl text-gray-400">
                          qr_code
                        </span>
                        <p className="text-xs text-gray-500 text-center px-2">
                          QR appears here after creation
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Section */}
                <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
                  <div className="flex gap-3">
                    <span className="material-symbols-rounded text-blue-600 flex-shrink-0">
                      info
                    </span>
                    <div>
                      <h4 className="font-semibold text-blue-900 text-sm">
                        How it works
                      </h4>
                      <p className="text-xs text-blue-700 mt-2">
                        Facilitators can scan the QR or use the access link to join the session. The link contains a secure identifier to control access.
                      </p>
                    </div>
                  </div>
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

/* -------------------- Helpers -------------------- */

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}