import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

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

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="h-9 bg-gray-200 rounded w-20 animate-pulse ml-auto"></div>
      </td>
    </tr>
  );
}

function TrainingCard({ training }: { training: Training }) {
  return (
    <Link to={`/trainings/${training._id}`}>
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer h-full flex flex-col">
        <div className="flex-1 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {training.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {training.description || "No description provided"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pass Mark</p>
            <p className="text-xl font-bold text-gray-900">
              {training.passMark ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Version</p>
            <p className="text-xl font-bold text-blue-600">
              v{training.currentQuestionSet?.version ?? "0"}
            </p>
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

  useEffect(() => {
    const fetchTrainings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authorization token found");

        const res = await axios.get<ApiResponse>(`${API_URL}/trainings`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        if (!res.data.success) throw new Error("Invalid response");
        setTrainings(res.data.trainings);
        setError(null);
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

    void fetchTrainings();
  }, []);

  const filteredTrainings = trainings.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTrainings = filteredTrainings.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  /* ---------------------- Loading State ---------------------- */
  if (loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Inductions" />
        <div className="flex min-h-screen w-full flex-col bg-gray-50">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="h-8 bg-gray-200 rounded w-40 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-64 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>

              {/* Table Skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4 text-left font-semibold text-gray-900">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4 text-right font-semibold text-gray-900">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse ml-auto"></div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {[...Array(5)].map((_, i) => (
                        <SkeletonRow key={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  /* ---------------------- Error State ---------------------- */
  if (error) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Inductions" />
        <div className="flex min-h-screen w-full flex-col bg-gray-50">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
            <div className="max-w-7xl mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <div className="flex items-start gap-4">
                  <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-2xl">
                    error
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-red-900">Failed to Load Inductions</h2>
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

  /* ---------------------- Main Content ---------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title="Inductions" />
      <div className="flex min-h-screen w-full flex-col bg-gray-50">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Inductions</h1>
                  <p className="text-gray-600 mt-1">Manage and configure inductions</p>
                </div>
                <Link to="/add-training">
                  <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                    <span className="material-symbols-rounded">add</span>
                    <span>Create Induction</span>
                  </button>
                </Link>
              </div>

              {/* Search and Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 relative">
                  <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search inductions..."
                    className="w-full pl-12 pr-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Inductions</span>
                  <span className="text-2xl font-bold text-blue-600">{trainings.length}</span>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            {trainings.length > 0 && (
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

                <span className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{currentTrainings.length}</span> of{" "}
                  <span className="font-semibold">{filteredTrainings.length}</span>
                </span>
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
                          Induction
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Pass Mark
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                          Version
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentTrainings.length > 0 ? (
                        currentTrainings.map((t) => (
                          <tr key={t._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{t.title}</td>
                            <td className="px-6 py-4 text-gray-600">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                                {t.passMark ?? "—"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                              <span className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                                <span className="material-symbols-rounded text-sm">
                                  deployed_code
                                </span>
                                v{t.currentQuestionSet?.version ?? "0"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Link to={`/trainings/${t._id}`}>
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
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                              layers_clear
                            </span>
                            <p className="text-gray-500 mt-2">
                              {search ? "No inductions match your search" : "No inductions found"}
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
                    {currentTrainings.map((training) => (
                      <TrainingCard key={training._id} training={training} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
                    <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                      layers_clear
                    </span>
                    <p className="text-gray-500 mt-2">
                      {search ? "No inductions match your search" : "No inductions found"}
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
      </div>
      <Footer />
    </div>
  );
}