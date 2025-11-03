import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* --------------------------- 🧩 Type Definitions --------------------------- */
interface Overview {
  totalAttempts: number;
  averageScore: number;
  passRate: string;
  failRate: string;
}

interface ScoreDistribution {
  min: number;
  max: number;
  median: number;
  mode: number;
  buckets: Record<string, number>;
}

interface TimeAnalysis {
  averageDurationMinutes: string | null;
  fastestAttemptMinutes: string | null;
  slowestAttemptMinutes: string | null;
  attemptsPerDay: Record<string, number>;
}

interface DepartmentStat {
  total: number;
  passed: number;
  averageScore: number;
  passRate: number;
}

interface Performer {
  name: string;
  score: number;
  department: string;
}

interface WeeklyStat {
  week: string;
  totalAttempts: number;
  passRate: number;
  newUsers: number;
}

interface FrequentFail {
  traineeName: string;
  failCount: number;
}

interface ReportData {
  overview: Overview;
  scoreDistribution: ScoreDistribution;
  timeAnalysis: TimeAnalysis;
  departmentBreakdown: Record<string, DepartmentStat>;
  topPerformers: Performer[];
  bottomPerformers: Performer[];
  weeklyStats: WeeklyStat[];
  frequentFails: FrequentFail[];
}

/* ------------------------------ 🛠️ Components ------------------------------ */

function StatCard({
  label,
  value,
  icon,
  color,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "red" | "yellow" | "purple" | "gray";
  subtitle?: string;
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-700",
    purple: "bg-purple-100 text-purple-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  );
}

/* ------------------------------ ⚙️ Main Component ------------------------------ */
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
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">
                Comprehensive Induction Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Deep insights into training performance, engagement, and outcomes
              </p>
            </div>

            {/* Main Layout */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-rounded text-blue-600">tune</span>
                    Filters
                  </h3>

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
                      className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Generating...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="material-symbols-rounded text-lg">analytics</span>
                          Generate Report
                        </span>
                      )}
                    </button>

                    {data && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Quick Stats</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Tests</span>
                            <span className="font-semibold">{data.overview.totalAttempts}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Avg Score</span>
                            <span className="font-semibold">{data.overview.averageScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Pass Rate</span>
                            <span className="font-semibold text-green-600">{data.overview.passRate}</span>
                          </div>
                        </div>
                      </div>
                    )}
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
                        <h4 className="font-semibold text-red-900">Unable to Load Report</h4>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {loading && !hasInitialized ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} />
                      ))}
                    </div>
                  </div>
                ) : data ? (
                  <div className="space-y-8">
                    {/* 📊 Overview Summary */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-600">dashboard</span>
                        Overview Summary
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                    {/* 📈 Score Distribution */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-purple-600">bar_chart</span>
                        Score Distribution
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Statistical Measures</h3>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Minimum Score</span>
                              <span className="font-bold text-red-600">{data.scoreDistribution.min}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Maximum Score</span>
                              <span className="font-bold text-green-600">{data.scoreDistribution.max}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Median Score</span>
                              <span className="font-bold text-blue-600">{data.scoreDistribution.median}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Mode (Most Common)</span>
                              <span className="font-bold text-purple-600">{data.scoreDistribution.mode}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">Score Ranges</h3>
                          <div className="space-y-3">
                            {Object.entries(data.scoreDistribution.buckets).map(([range, count]) => (
                              <div key={range}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-600">Score {range}</span>
                                  <span className="font-semibold">{count} tests</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{
                                      width: `${(count / data.overview.totalAttempts) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* ⏱️ Time Analysis */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-yellow-600">schedule</span>
                        Time Analysis
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <StatCard
                          label="Average Duration"
                          value={data.timeAnalysis.averageDurationMinutes ? `${data.timeAnalysis.averageDurationMinutes} min` : "N/A"}
                          icon="timer"
                          color="yellow"
                        />
                        <StatCard
                          label="Fastest Attempt"
                          value={data.timeAnalysis.fastestAttemptMinutes ? `${data.timeAnalysis.fastestAttemptMinutes} min` : "N/A"}
                          icon="flash_on"
                          color="green"
                        />
                        <StatCard
                          label="Slowest Attempt"
                          value={data.timeAnalysis.slowestAttemptMinutes ? `${data.timeAnalysis.slowestAttemptMinutes} min` : "N/A"}
                          icon="hourglass_empty"
                          color="red"
                        />
                      </div>

                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Daily Activity</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {Object.entries(data.timeAnalysis.attemptsPerDay)
                            .sort(([a], [b]) => b.localeCompare(a))
                            .map(([day, count]) => (
                              <div key={day} className="flex items-center gap-3">
                                <span className="text-sm text-gray-600 w-28">{day}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                                  <div
                                    className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                                    style={{
                                      width: `${(count / Math.max(...Object.values(data.timeAnalysis.attemptsPerDay))) * 100}%`,
                                      minWidth: "30px",
                                    }}
                                  >
                                    <span className="text-xs font-semibold text-white">{count}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </section>

                    {/* 🏢 Department Performance */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-blue-600">apartment</span>
                        Department Performance
                      </h2>
                      <div className="bg-white rounded-xl border border-gray-200 p-6">
                        {Object.entries(data.departmentBreakdown).length > 0 ? (
                          <div className="space-y-6">
                            {Object.entries(data.departmentBreakdown)
                              .sort(([, a], [, b]) => b.passRate - a.passRate)
                              .map(([dept, stats]) => {
                                const passRate = Math.min(stats.passRate, 100);
                                return (
                                  <div key={dept} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center mb-3">
                                      <h4 className="font-semibold text-gray-900 text-lg">{dept}</h4>
                                      <div className="flex gap-6 text-sm">
                                        <span className="text-gray-600">
                                          <span className="font-semibold text-gray-900">{stats.passed}</span>/{stats.total} passed
                                        </span>
                                        <span className="font-bold text-blue-600">{passRate.toFixed(1)}%</span>
                                      </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
                                      <div
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${passRate}%` }}
                                      ></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>Avg Score: {stats.averageScore.toFixed(1)}%</span>
                                      <span>{stats.total} total attempts</span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                            <span className="material-symbols-rounded text-4xl mb-2">layers_clear</span>
                            <p>No department data available</p>
                          </div>
                        )}
                      </div>
                    </section>

                    {/* 🏆 Top & Bottom Performers */}
                    <section>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="material-symbols-rounded text-yellow-600">emoji_events</span>
                        Performance Leaderboard
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Top Performers */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="font-semibold text-green-700 mb-4 flex items-center gap-2">
                            <span className="material-symbols-rounded">arrow_upward</span>
                            Top Performers
                          </h3>
                          <div className="space-y-3">
                            {data.topPerformers.map((performer, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{performer.name}</p>
                                    <p className="text-xs text-gray-500">{performer.department}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-green-700 text-lg">{performer.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Performers */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <h3 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
                            <span className="material-symbols-rounded">arrow_downward</span>
                            Need Support
                          </h3>
                          <div className="space-y-3">
                            {data.bottomPerformers.map((performer, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{performer.name}</p>
                                    <p className="text-xs text-gray-500">{performer.department}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-red-700 text-lg">{performer.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* ⚠️ At-Risk Trainees */}
                    {data.frequentFails && data.frequentFails.length > 0 && (
                      <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="material-symbols-rounded text-red-600">warning</span>
                          At-Risk Trainees (3+ Failures)
                        </h2>
                        <div className="bg-white rounded-xl border border-red-200 p-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {data.frequentFails.map((trainee, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100"
                              >
                                <div>
                                  <p className="font-semibold text-gray-900">{trainee.traineeName}</p>
                                  <p className="text-sm text-red-600">{trainee.failCount} failures</p>
                                </div>
                                <span className="material-symbols-rounded text-red-600">priority_high</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* 📅 Weekly Trends */}
                    {data.weeklyStats && data.weeklyStats.length > 0 && (
                      <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span className="material-symbols-rounded text-purple-600">calendar_month</span>
                          Weekly Trends
                        </h2>
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200">
                                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Week</th>
                                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Attempts</th>
                                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Pass Rate</th>
                                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">New Users</th>
                                </tr>
                              </thead>
                              <tbody>
                                {data.weeklyStats
                                  .sort((a, b) => b.week.localeCompare(a.week))
                                  .map((week, idx) => (
                                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                                      <td className="py-3 px-4 text-sm text-gray-900">{week.week}</td>
                                      <td className="py-3 px-4 text-sm text-right font-semibold">{week.totalAttempts}</td>
                                      <td className="py-3 px-4 text-sm text-right">
                                        <span className={`font-semibold ${week.passRate >= 70 ? "text-green-600" : "text-red-600"}`}>
                                          {week.passRate}%
                                        </span>
                                      </td>
                                      <td className="py-3 px-4 text-sm text-right text-blue-600 font-semibold">{week.newUsers}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <span className="material-symbols-rounded text-6xl text-gray-300 inline-block mb-4">assessment</span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Report Generated</h3>
                    <p className="text-gray-500">Select a time range and click "Generate Report" to view comprehensive analytics</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}