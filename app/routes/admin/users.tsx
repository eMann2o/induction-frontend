import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router";
import Swal from "sweetalert2";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* ------------------------------ 🧩 Types ------------------------------ */
interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status?: "active" | "inactive";
  phoneNumber?: string;
}

interface ApiResponse {
  success: boolean;
  count: number;
  users: User[];
}

/* ------------------------------ 🛠️ Components ------------------------------ */

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-200">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2 justify-end">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </td>
    </tr>
  );
}

function UserAvatar({ name }: { name: string }) {
  const getColor = (str: string) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-red-500",
      "bg-purple-500",
      "bg-yellow-500",
      "bg-pink-500",
    ];
    return colors[str.charCodeAt(0) % colors.length];
  };

  return (
    <div
      className={`w-10 h-10 ${getColor(name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
    >
      {name?.charAt(0).toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status?: "active" | "inactive" }) {
  const isActive = status === "active";
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
    >
      <span className="material-symbols-rounded text-sm">
        {isActive ? "check_circle" : "cancel"}
      </span>
      <span>{isActive ? "Active" : "Inactive"}</span>
    </div>
  );
}

function ActionButton({
  icon,
  onClick,
  variant = "default",
  tooltip,
}: {
  icon: string;
  onClick: () => void;
  variant?: "default" | "edit" | "view" | "toggle" | "delete";
  tooltip: string;
}) {
  const variants = {
    default: "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
    edit: "text-blue-500 hover:text-blue-700 hover:bg-blue-50",
    view: "text-cyan-500 hover:text-cyan-700 hover:bg-cyan-50",
    toggle: "text-orange-500 hover:text-orange-700 hover:bg-orange-50",
    delete: "text-red-500 hover:text-red-700 hover:bg-red-50",
  };

  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-all group relative ${variants[variant]}`}
      title={tooltip}
    >
      <span className="material-symbols-rounded text-lg">{icon}</span>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {tooltip}
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧩 Main Component                                                         */
/* -------------------------------------------------------------------------- */

export default function Trainees() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  /* -------------------------- 🔁 Fetch Users -------------------------- */
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token");

      const res = await axios.get<ApiResponse>(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (!res.data.success) throw new Error("Failed to fetch users");
      setUsers(res.data.users);
      setFiltered(res.data.users);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  /* ---------------------------- 🧮 Filtering --------------------------- */
  useEffect(() => {
    let results = users.filter((u) =>
      u.name.toLowerCase().includes(search.toLowerCase())
    );

    if (roleFilter) results = results.filter((u) => u.role === roleFilter);
    if (departmentFilter)
      results = results.filter((u) => u.department === departmentFilter);
    if (statusFilter)
      results = results.filter((u) => u.status === statusFilter);

    setFiltered(results);
    setCurrentPage(1);
  }, [search, roleFilter, departmentFilter, statusFilter, users]);

  /* --------------------------- 🔢 Pagination --------------------------- */
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filtered.slice(indexOfFirstItem, indexOfLastItem);

  /* -------------------------- ⚡ Toggle Status -------------------------- */
  const toggleStatus = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const confirm = await Swal.fire({
        title: "Toggle User Status?",
        text: "This will activate or deactivate the trainee.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, toggle",
        cancelButtonText: "Cancel",
      });

      if (!confirm.isConfirmed) return;

      const res = await axios.patch(
        `${API_URL}/users/${id}/status`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id
              ? { ...u, status: u.status === "active" ? "inactive" : "active" }
              : u
          )
        );

        Swal.fire({
          icon: "success",
          title: "Status Updated!",
          text: res.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update status",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  /* -------------------------- 🗑️ Delete User --------------------------- */
  const deleteUser = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const confirm = await Swal.fire({
        title: "Delete User?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, delete",
        cancelButtonText: "Cancel",
      });

      if (!confirm.isConfirmed) return;

      const res = await axios.delete(`${API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (res.data.success) {
        setUsers((prev) => prev.filter((u) => u._id !== id));

        Swal.fire({
          icon: "success",
          title: "User Deleted",
          text: res.data.message,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to delete user",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  /* ----------------------------- 🧭 UI ----------------------------- */

  if (loading) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Users" />
        <div className="bg-gray-50 min-h-screen">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
            <div className="max-w-7xl mx-auto">
              {/* Header Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
              </div>

              {/* Filters Skeleton */}
              <div className="mb-6 flex flex-wrap gap-3">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-gray-200 rounded w-32 animate-pulse"
                  ></div>
                ))}
              </div>

              {/* Table Skeleton */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </th>
                        <th className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse ml-auto"></div>
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

  if (error) {
    return (
      <div>
        <AdminNavbar />
      <Title title="Users" />
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
                      Failed to Load Users
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

  const departments = Array.from(
    new Set(users.map((u) => u.department).filter(Boolean))
  );
  const roles = Array.from(new Set(users.map((u) => u.role)));

  return (
    <div>
      <AdminNavbar />
      <Title title="Users" />
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-1">
                  Manage system users and permissions
                </p>
              </div>
              <Link to="/hr/new-user">
                <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                  <span className="material-symbols-rounded">add</span>
                  <span>New User</span>
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Active Users
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {users.filter((u) => u.status === "active").length}
                </p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                  Filtered Results
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {filtered.length}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="relative lg:col-span-2">
                  <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Roles</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Department Filter */}
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((u) => (
                        <tr
                          key={u._id}
                          className={`transition-colors ${u.status === "inactive"
                              ? "bg-gray-50 opacity-70"
                              : "hover:bg-gray-50"
                            }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={u.name} />
                              <div>
                                <p
                                  className={`text-sm font-semibold ${u.status === "inactive"
                                      ? "text-gray-500 line-through"
                                      : "text-gray-900"
                                    }`}
                                >
                                  {u.name}
                                </p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {u.department ?? "—"}
                          </td>
                          <td className="px-6 py-4">
                            <StatusBadge status={u.status} />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1">
                              <Link to={`/admin/user/${u._id}`}>
                                <ActionButton
                                  icon="visibility"
                                  onClick={() => { }}
                                  variant="view"
                                  tooltip="View Profile"
                                />
                              </Link>

                              {/* 🔄 Toggle Button (Always Active) */}
                              <ActionButton
                                icon={u.status === "active" ? "toggle_on" : "toggle_off"}
                                onClick={() => toggleStatus(u._id)}
                                variant="toggle"
                                tooltip={u.status === "active" ? "Deactivate" : "Activate"}
                              />

                              {/* ❌ Delete Button (Disabled if inactive) */}
                              <div
                                className={`${u.status === "inactive"
                                    ? "opacity-40 pointer-events-none"
                                    : "opacity-100"
                                  }`}
                              >
                                <ActionButton
                                  icon="delete"
                                  onClick={() => deleteUser(u._id)}
                                  variant="delete"
                                  tooltip={
                                    u.status === "inactive"
                                      ? "Inactive users cannot be deleted"
                                      : "Delete User"
                                  }
                                />
                              </div>
                            </div>
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                            group_off
                          </span>
                          <p className="text-gray-500 mt-2">
                            {search || roleFilter || departmentFilter || statusFilter
                              ? "No users match your filters"
                              : "No users found"}
                          </p>
                        </td>
                      </tr>
                    )}
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
