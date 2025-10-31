import { useEffect, useState } from "react";
import axios from "axios";
import Chart from "chart.js/auto";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";

const API_URL = "http://localhost:3000";

interface DepartmentStats {
  total: number;
}

interface Stats {
  totalUsers: number;
  totalTrainings: number;
  passRate: number;
  activity: number;
  attemptsPerDay: Record<string, number>;
  usersAddedPerDay: Record<string, number>;
  departmentData: Record<string, DepartmentStats>;
}

interface Alert {
  type: "warning" | "error" | "info";
  title: string;
  message: string;
}

const departmentColors: Record<string, string> = {
  IT: "#3b82f6",
  HR: "#22c55e",
  Finance: "#f59e0b",
  Marketing: "#ef4444",
  Engineering: "#a855f7",
  Operations: "#14b8a6",
  Sales: "#eab308",
  Logistics: "#6366f1",
  Default: "#9ca3af",
};

/* ------------------------------ 🛠️ Components ------------------------------ */

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-8 w-8 bg-gray-200 rounded"></div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-12"></div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-2 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  change,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  change?: string;
  color?: "blue" | "green" | "red" | "purple";
}) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    purple: "bg-purple-100 text-purple-700",
  };

  const changeColorMap = {
    green: "text-green-600",
    red: "text-red-600",
  };

  const changeColor = change?.includes("+")
    ? changeColorMap.green
    : change?.includes("-")
      ? changeColorMap.red
      : "text-gray-600";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`p-2.5 rounded-lg ${colorMap[color || "blue"]}`}>
          <span className="material-symbols-rounded text-lg">{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change && <p className={`text-xs mt-2 font-medium ${changeColor}`}>{change}</p>}
    </div>
  );
}

function AlertBox({ alert, index }: { alert: Alert; index: number }) {
  const typeConfig = {
    error: {
      bg: "bg-red-50",
      border: "border-l-4 border-red-500",
      text: "text-red-900",
      icon: "error",
      iconColor: "text-red-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-l-4 border-yellow-500",
      text: "text-yellow-900",
      icon: "warning",
      iconColor: "text-yellow-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-l-4 border-blue-500",
      text: "text-blue-900",
      icon: "info",
      iconColor: "text-blue-600",
    },
  };

  const config = typeConfig[alert.type];

  return (
    <div
      key={index}
      className={`${config.bg} ${config.border} rounded-lg p-4 flex items-start gap-4`}
    >
      <span className={`material-symbols-rounded flex-shrink-0 mt-0.5 ${config.iconColor}`}>
        {config.icon}
      </span>
      <div className="flex-1">
        <p className={`font-semibold ${config.text}`}>{alert.title}</p>
        <p className={`text-sm mt-1 ${config.text} opacity-90`}>{alert.message}</p>
      </div>
    </div>
  );
}

/* ------------------------------ ⚙️ Main Component ------------------------------ */

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalTrainings: 0,
    passRate: 0,
    activity: 0,
    attemptsPerDay: {},
    usersAddedPerDay: {},
    departmentData: {},
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [range, setRange] = useState<"7" | "30" | "90">("7");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");

        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - parseInt(range));

        const [usersRes, trainingRes, reportRes] = await Promise.allSettled([
          axios.get(`${API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(`${API_URL}/trainings`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }),
          axios.get(
            `${API_URL}/reports/attempts?startDate=${start.toISOString()}&endDate=${end.toISOString()}`,
            {
              headers: { Authorization: `Bearer ${token}` },
              withCredentials: true,
            }
          ),
        ]);

        const usersData =
          usersRes.status === "fulfilled"
            ? usersRes.value.data?.users || usersRes.value.data || []
            : [];
        const trainingsData =
          trainingRes.status === "fulfilled"
            ? trainingRes.value.data?.trainings || trainingRes.value.data || []
            : [];
        const reportData =
          reportRes.status === "fulfilled" &&
          reportRes.value.data?.success !== false
            ? reportRes.value.data
            : null;

        const { overview, timeAnalysis, frequentFails } = reportData || {};

        // ---------- SYSTEM ALERTS ----------
        const newAlerts: Alert[] = [];

        const missingTrainings = Array.isArray(trainingsData)
          ? trainingsData.filter((t: any) => !t.questionSetId)
          : [];
        if (missingTrainings.length > 0) {
          newAlerts.push({
            type: "warning",
            title: "Trainings Missing Question Sets",
            message: `${missingTrainings.length} training(s) have no linked question sets.`,
          });
        }

        const failingTrainees = frequentFails || [];
        if (failingTrainees.length > 0) {
          newAlerts.push({
            type: "warning",
            title: "Repeated Trainee Failures",
            message: `${failingTrainees.length} trainee(s) failed 3+ consecutive attempts.`,
          });
        }

        if (!reportData || reportData.success === false) {
          newAlerts.push({
            type: "info",
            title: "No Attempt Data",
            message: "No attempts were recorded in this selected date range.",
          });
        }

        // ---------- DEPARTMENT DISTRIBUTION ----------
        const departmentCount: Record<string, number> = {};
        usersData.forEach((u: any) => {
          const dept = u.department || "Unknown";
          departmentCount[dept] = (departmentCount[dept] || 0) + 1;
        });

        // ---------- USERS ADDED PER DAY ----------
        const usersAddedPerDay: Record<string, number> = {};
        usersData.forEach((u: any) => {
          const created = new Date(u.createdAt);
          if (created >= start && created <= end) {
            const day = created.toISOString().split("T")[0];
            usersAddedPerDay[day] = (usersAddedPerDay[day] || 0) + 1;
          }
        });

        const cleanAttemptsPerDay: Record<string, number> = Object.fromEntries(
          Object.entries(timeAnalysis?.attemptsPerDay || {})
            .filter(([, val]: [string, unknown]) => typeof val === "number" && val > 0)
            .map(([key, val]) => [key, Number(val)])
        );
        const cleanUserGrowth = Object.fromEntries(
          Object.entries(usersAddedPerDay).filter(([, val]) => val > 0)
        );

        setStats({
          totalUsers: usersData.length || 0,
          totalTrainings: trainingsData.length || 0,
          passRate: Number(overview?.passRate) || 0,
          activity: overview?.totalAttempts || 0,
          attemptsPerDay: cleanAttemptsPerDay,
          usersAddedPerDay: cleanUserGrowth,
          departmentData: Object.keys(departmentCount).reduce(
            (acc, key) => ({ ...acc, [key]: { total: departmentCount[key] } }),
            {}
          ),
        });
        setAlerts(newAlerts);
        setError("");
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  // ---------- CHARTS ----------
  useEffect(() => {
    let attemptChart: Chart | null = null;
    let userDistChart: Chart | null = null;
    let userGrowthChart: Chart | null = null;

    const attemptsCanvas = document.getElementById(
      "attemptsChart"
    ) as HTMLCanvasElement | null;
    const userDistCanvas = document.getElementById(
      "userDistributionChart"
    ) as HTMLCanvasElement | null;
    const userGrowthCanvas = document.getElementById(
      "userGrowthChart"
    ) as HTMLCanvasElement | null;

    if (attemptsCanvas && Object.keys(stats.attemptsPerDay).length > 0) {
      attemptChart = new Chart(attemptsCanvas, {
        type: "line",
        data: {
          labels: Object.keys(stats.attemptsPerDay),
          datasets: [
            {
              label: "Attempts per Day",
              data: Object.values(stats.attemptsPerDay),
              borderColor: "#2563eb",
              backgroundColor: "#2563eb20",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: "#2563eb",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
            x: { grid: { color: "#f3f4f6" } },
          },
          plugins: { legend: { display: true, position: "top" } },
        },
      });
    }

    if (userDistCanvas && Object.keys(stats.departmentData).length > 0) {
      userDistChart = new Chart(userDistCanvas, {
        type: "doughnut",
        data: {
          labels: Object.keys(stats.departmentData),
          datasets: [
            {
              data: Object.values(stats.departmentData).map((d) => d.total),
              backgroundColor: Object.keys(stats.departmentData).map(
                (d) => departmentColors[d] || departmentColors["Default"]
              ),
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const label = ctx.label || "";
                  const value = ctx.parsed || 0;
                  const total = Object.values(stats.departmentData).reduce(
                    (sum, d) => sum + d.total,
                    0
                  );
                  const percent = total ? ((value / total) * 100).toFixed(1) : "0";
                  return `${label}: ${value} (${percent}%)`;
                },
              },
            },
          },
        },
      });
    }

    if (userGrowthCanvas && Object.keys(stats.usersAddedPerDay).length > 0) {
      userGrowthChart = new Chart(userGrowthCanvas, {
        type: "line",
        data: {
          labels: Object.keys(stats.usersAddedPerDay),
          datasets: [
            {
              label: "New Users",
              data: Object.values(stats.usersAddedPerDay),
              borderColor: "#22c55e",
              backgroundColor: "#22c55e20",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 5,
              pointBackgroundColor: "#22c55e",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
            x: { grid: { color: "#f3f4f6" } },
          },
          plugins: { legend: { display: true, position: "top" } },
        },
      });
    }

    return () => {
      attemptChart?.destroy();
      userDistChart?.destroy();
      userGrowthChart?.destroy();
    };
  }, [stats]);

  if (loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Dashboard" />
        <main className="flex-1 bg-gray-50 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>

            {/* Stat Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              <div className="lg:col-span-3">
                <SkeletonChart />
              </div>
              <div className="lg:col-span-2">
                <SkeletonChart />
              </div>
            </div>

            <SkeletonChart />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Dashboard" />
        <main className="flex-1 bg-gray-50 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <span className="material-symbols-rounded text-4xl text-red-600 inline-block mb-3">
                error
              </span>
              <h2 className="text-xl font-bold text-red-900 mt-2">Failed to Load Dashboard</h2>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const rangeLabel =
    range === "7"
      ? "Last 7 Days"
      : range === "30"
        ? "Last 30 Days"
        : "Last 90 Days";

  return (
    <div>
      <AdminNavbar />
      <Title title="Dashboard" />
      <main className="flex-1 bg-gray-50 px-4 sm:px-6 lg:px-8 py-20 pt-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">{rangeLabel}</p>
            </div>
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as "7" | "30" | "90")}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-900 hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon="group"
              change="+12%"
              color="blue"
            />
            <StatCard
              title="Total Trainings"
              value={stats.totalTrainings}
              icon="school"
              change="Active"
              color="green"
            />
            <StatCard
              title="Pass Rate"
              value={`${stats.passRate}%`}
              icon="verified"
              change={stats.passRate >= 80 ? "+2.1%" : "-1.2%"}
              color={stats.passRate >= 80 ? "green" : "red"}
            />
            <StatCard
              title="Attempts"
              value={stats.activity}
              icon="trending_up"
              change="Active"
              color="purple"
            />
          </div>

          {/* System Alerts */}
          {alerts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alerts.map((alert, i) => (
                  <AlertBox key={i} alert={alert} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Attempts Trend</h2>
              {Object.keys(stats.attemptsPerDay).length > 0 ? (
                <canvas id="attemptsChart"></canvas>
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <span className="material-symbols-rounded mr-2">layers_clear</span>
                  <p>No attempt data available</p>
                </div>
              )}
            </div>
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Distribution by Department
              </h2>
              {Object.keys(stats.departmentData).length > 0 ? (
                <canvas id="userDistributionChart"></canvas>
              ) : (
                <div className="flex items-center justify-center py-12 text-gray-500">
                  <span className="material-symbols-rounded mr-2">layers_clear</span>
                  <p>No department data</p>
                </div>
              )}
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              New Users Added ({rangeLabel})
            </h2>
            {Object.keys(stats.usersAddedPerDay).length > 0 ? (
              <canvas id="userGrowthChart"></canvas>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <span className="material-symbols-rounded mr-2">layers_clear</span>
                <p>No user growth data available</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}