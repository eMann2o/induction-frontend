import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";

const API_URL = "http://localhost:3000";

/* --------------------------- 🧩 Type Definitions --------------------------- */
interface Overview {
  totalAttempts: number;
  averageScore: number;
  passRate: string;
  failRate: string;
}

interface DepartmentStat {
  total: number;
  passed: number;
  averageScore: number;
  passRate: number;
}

interface ReportData {
  overview: Overview;
  departmentBreakdown: Record<string, DepartmentStat>;
  weeklyStats: any[];
}

/* ------------------------------ 🛠️ Components ------------------------------ */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "red" | "gray";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <span className="material-symbols-rounded text-xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

function SkeletonBar() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ ⚙️ Component ------------------------------ */
export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      // Compute date range
      const end = new Date();
      const start = new Date();

      if (timeRange === "30") start.setDate(end.getDate() - 30);
      else if (timeRange === "90") start.setDate(end.getDate() - 90);
      else if (timeRange === "year") start.setMonth(0, 1);

      const res = await axios.get(`${API_URL}/reports/attempts`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        },
        withCredentials: true,
      });

      if (res.data.success) {
        setData(res.data);
      } else if (res.data.message === "No attempts found in this time range") {
        setData(null);
        setError(null);
        Swal.fire({
          icon: "info",
          title: "No Data",
          text: "No attempts were found for the selected time range.",
          confirmButtonColor: "#2563eb",
        });
      } else {
        throw new Error(res.data.message || "Failed to fetch report");
      }

    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message;
      setError(errorMsg);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Report",
        text: errorMsg,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [timeRange]);

  return (
    <div>
      <AdminNavbar />
      <Title title="Reports" />
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8 pt-24">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Reports</h1>
              <p className="mt-2 text-gray-600">
                View detailed analytics on training performance and progress metrics
              </p>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Range
                      </label>
                      <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        disabled={loading}
                      >
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>

                    <button
                      onClick={fetchReports}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Generating...
                        </span>
                      ) : (
                        "Generate Report"
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3">
                {error && (
                  <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-rounded text-red-600 flex-shrink-0">
                        error
                      </span>
                      <div>
                        <h4 className="font-semibold text-red-900">
                          Unable to Load Report
                        </h4>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {loading && !hasInitialized ? (
                  <div className="space-y-6">
                    {/* Summary Skeleton */}
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                          <SkeletonCard key={i} />
                        ))}
                      </div>
                    </div>

                    {/* Department Skeleton */}
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <SkeletonBar />
                      </div>
                    </div>
                  </div>
                ) : data ? (
                  <div className="space-y-6">
                    {/* Summary Section */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Summary
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <StatCard
                          label="Total Attempts"
                          value={data.overview.totalAttempts}
                          icon="assignment"
                          color="blue"
                        />
                        <StatCard
                          label="Average Score"
                          value={`${data.overview.averageScore}%`}
                          icon="trending_up"
                          color="blue"
                        />
                        <StatCard
                          label="Pass Rate"
                          value={data.overview.passRate}
                          icon="check_circle"
                          color="green"
                        />
                        <StatCard
                          label="Fail Rate"
                          value={data.overview.failRate}
                          icon="cancel"
                          color="red"
                        />
                      </div>
                    </section>

                    {/* Department Breakdown */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Performance by Department
                      </h3>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        {Object.entries(data.departmentBreakdown).length > 0 ? (
                          <div className="space-y-6">
                            {Object.entries(data.departmentBreakdown).map(
                              ([dept, stats]) => {
                                const passRate = Math.min(
                                  stats.passRate,
                                  100
                                );
                                return (
                                  <div key={dept}>
                                    <div className="flex justify-between items-center mb-2">
                                      <h4 className="font-semibold text-gray-900">
                                        {dept}
                                      </h4>
                                      <div className="flex gap-4 text-sm text-gray-600">
                                        <span>
                                          {stats.passed}/{stats.total} passed
                                        </span>
                                        <span className="font-semibold text-gray-900">
                                          {passRate.toFixed(1)}%
                                        </span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                      <div
                                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${passRate}%` }}
                                      ></div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Avg Score: {stats.averageScore.toFixed(1)}%
                                    </p>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <span className="material-symbols-rounded text-4xl mb-2">
                              layers_clear
                            </span>
                            <p>No department data available</p>
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-3">
                      assessment
                    </span>
                    <p className="text-gray-500">
                      Select a time range and click "Generate Report" to view analytics
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}