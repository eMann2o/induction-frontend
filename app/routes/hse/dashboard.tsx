import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";
import Swal from "sweetalert2";

const API_URL = "http://localhost:3000";

/* -------------------------------------------------------------------------- */
/* 🧩 Types                                                                  */
/* -------------------------------------------------------------------------- */
interface Training {
  _id: string;
  title: string;
  description?: string;
  passMark?: number;
  currentQuestionSet?: {
    version: number;
  };
  sessionDate?: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  trainings: Training[];
}

/* -------------------------------------------------------------------------- */
/* 🛠️ Components                                                             */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-32 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

function SkeletonRow() {
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

function TrainingCard({ training }: { training: Training }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
          {training.title}
        </h3>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
          <Link to={`/edit-training/${training._id}`}>
            <button className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
              <span className="material-symbols-rounded text-lg">edit</span>
            </button>
          </Link>
          <button
            onClick={(e) => {
              e.preventDefault();
              handleDeleteClick(training._id);
            }}
            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <span className="material-symbols-rounded text-lg">delete</span>
          </button>
        </div>
      </div>

      {training.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {training.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pass Mark</p>
          <p className="text-lg font-bold text-gray-900 mt-1">
            {training.passMark ?? "—"}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
          <p className="text-lg font-bold text-blue-600 mt-1">
            v{training.currentQuestionSet?.version ?? "0"}
          </p>
        </div>
      </div>

      <Link to={`/edit-training/${training._id}`} className="mt-4 block">
        <button className="w-full py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium transition-colors flex items-center justify-center gap-2">
          <span className="material-symbols-rounded text-lg">arrow_forward</span>
          View Details
        </button>
      </Link>
    </div>
  );
}

/* ----------------------- Placeholder Handler ----------------------- */
let handleDeleteClick = (id: string) => {};

/* -------------------------------------------------------------------------- */
/* 🧩 Main Component                                                         */
/* -------------------------------------------------------------------------- */
export default function Trainings() {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const itemsPerPage = 10;

  // Update the delete handler
  handleDeleteClick = (id: string) => handleDelete(id);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      const res = await axios.get<ApiResponse>(`${API_URL}/trainings`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (!res.data.success) throw new Error("Invalid response");
      setTrainings(res.data.trainings);
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ??
        (err as Error).message ??
        "Failed to fetch trainings";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirm = await Swal.fire({
      title: "Delete Induction?",
      text: "This will permanently delete the training program. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/trainings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setTrainings(trainings.filter((t) => t._id !== id));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Induction has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire(
        "Error",
        "Failed to delete training.",
        "error"
      );
    }
  };

  const filteredTrainings = trainings.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrainings = filteredTrainings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => setCurrentPage(page);

  /* ---------------------- Loading State ---------------------- */
  if (loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Dashboard" />
        <main className="min-h-screen bg-gray-50 py-20 pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="mb-8">
              <div className="h-10 bg-gray-200 rounded w-64 animate-pulse mb-2"></div>
              <div className="h-5 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>

            {/* Search Skeleton */}
            <div className="mb-6 h-10 bg-gray-200 rounded w-96 animate-pulse"></div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------------------- Error State ---------------------- */
  if (error) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Dashboard" />
        <main className="min-h-screen bg-gray-50 py-20 pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-2xl">
                  error
                </span>
                <div>
                  <h2 className="text-xl font-bold text-red-900">
                    Failed to Load Trainings
                  </h2>
                  <p className="text-red-700 mt-2">{error}</p>
                  <button
                    onClick={fetchTrainings}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ---------------------- Main Content ---------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title="Dashboard" />
      <main className="min-h-screen bg-gray-50 py-20 pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Trainings</h1>
              <p className="text-gray-600 mt-1">
                Manage all training programs
              </p>
            </div>
            <Link to="/add-training">
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                <span className="material-symbols-rounded">add</span>
                <span>Create Induction</span>
              </button>
            </Link>
          </div>

          {/* Search & View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 sm:flex-initial sm:w-96">
              <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                search
              </span>
              <input
                type="text"
                placeholder="Search trainings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-11 pr-4 py-2.5 w-full bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* View Toggle */}
            {trainings.length > 0 && (
              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
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
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="material-symbols-rounded inline mr-1">view_comfy</span>
                  Grid
                </button>
              </div>
            )}
          </div>

          {/* Results Counter */}
          {trainings.length > 0 && (
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold">{currentTrainings.length}</span> of{" "}
              <span className="font-semibold">{filteredTrainings.length}</span> trainings
            </div>
          )}

          {/* Table View */}
          {viewMode === "table" && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Pass Mark
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Version
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentTrainings.length > 0 ? (
                      currentTrainings.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {t.title}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {t.passMark ?? "—"}%
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              <span className="material-symbols-rounded text-sm">
                                deployed_code
                              </span>
                              v{t.currentQuestionSet?.version ?? "0"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link to={`/edit-training/${t._id}`}>
                                <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                  <span className="material-symbols-rounded text-lg">
                                    edit
                                  </span>
                                  Edit
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(t._id)}
                                className="text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                              >
                                <span className="material-symbols-rounded text-lg">
                                  delete
                                </span>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center">
                          <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                            layers_clear
                          </span>
                          <p className="text-gray-500 mt-2">
                            {search ? "No trainings match your search" : "No trainings found"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div>
              {currentTrainings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {currentTrainings.map((t) => (
                    <TrainingCard key={t._id} training={t} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                  <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                    layers_clear
                  </span>
                  <p className="text-gray-500 mt-2">
                    {search ? "No trainings match your search" : "No trainings found"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {filteredTrainings.length > itemsPerPage && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-rounded">chevron_left</span>
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
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
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-rounded">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}