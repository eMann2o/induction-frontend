import { Link } from "react-router";
import { useEffect, useState } from "react";

/** ✅ Strongly typed user object */
interface User {
  name?: string;
  role?: "superadmin" | "hr" | "facilitator" | "hse" | "trainee";
  email?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export default function AdminNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("user");
      }
    }

    setIsChecking(false);
  }, []);

  const getRoleNavigation = (): NavItem[] => {
    const baseRole = user?.role;

    const navMaps: Record<string, NavItem[]> = {
      superadmin: [
        { label: "Dashboard", path: "/admin", icon: "grid_view" },
        { label: "Sessions", path: "/admin/sessions", icon: "folder" },
        { label: "Inductions", path: "/admin/trainings", icon: "list" },
        { label: "Users", path: "/admin/users", icon: "group" },
        { label: "Reports", path: "/admin/reports", icon: "bar_chart" },
      ],
      hr: [
        { label: "Dashboard", path: "/hr", icon: "grid_view" },
        { label: "Sessions", path: "/hr/sessions", icon: "folder" },
        { label: "Inductions", path: "/hr/inductions", icon: "list" },
        { label: "Users", path: "/hr/users", icon: "group" },
        { label: "Reports", path: "/hr/reports", icon: "bar_chart" },
      ],
      facilitator: [
        { label: "Dashboard", path: "/facilitator", icon: "grid_view" },
        { label: "Reports", path: "/facilitator/reports", icon: "bar_chart" },
      ],
      hse: [
        { label: "Dashboard", path: "/hse", icon: "grid_view" },
        { label: "Inductions", path: "/hse/trainings", icon: "list" },
      ],
      trainee: [
        { label: "Dashboard", path: "/dashboard", icon: "grid_view" },
        { label: "Assessment", path: "/departments", icon: "group" },
      ],
    };

    return navMaps[baseRole || "trainee"] || [];
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  if (isChecking) {
    return (
      <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo Skeleton */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse hidden sm:block"></div>
          </div>

          {/* Nav Skeleton */}
          <div className="hidden lg:flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>

          {/* User Section Skeleton */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="hidden md:flex flex-col gap-1">
                <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-2 w-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="lg:hidden w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  if (!user) {
    return (
      <header className="fixed top-0 left-0 w-full bg-red-50 border-b border-red-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center gap-3">
          <div className="flex items-center gap-3 text-red-700">
            <div className="p-2 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-rounded text-lg">error</span>
            </div>
            <div>
              <p className="font-semibold text-sm">Authentication Required</p>
              <p className="text-xs opacity-90">Please log in to continue</p>
            </div>
            <Link to="/" className="ml-auto px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </header>
    );
  }

  const navItems = getRoleNavigation();

  return (
    <header className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Adamus Inductions Logo"
                  className="w-full h-full object-cover"
                />
              </div>
          <span className="text-lg font-bold text-gray-900 hidden sm:inline group-hover:text-blue-600 transition-colors duration-200">
            Adamus Resources Limited
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item, idx) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hover:shadow-sm"
              style={{
                animation: `slideInDown 0.3s ease-out ${idx * 0.05}s both`
              }}
            >
              <span className="material-symbols-rounded text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Profile & Mobile Menu */}
        <div className="flex items-center gap-3">
          {/* User Dropdown - Desktop */}
          <div className="hidden sm:flex relative group">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200 group-hover:shadow-sm"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold shadow-sm group-hover:shadow-md transition-all duration-200 group-hover:scale-110">
                {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-1">
                  {user.name || user.email || "User"}
                </p>
                <p className="text-xs text-gray-500 leading-tight capitalize line-clamp-1">
                  {(user.role || "Role").replace(/_/g, " ")}
                </p>
              </div>
              <span className={`material-symbols-rounded text-gray-400 text-lg transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}>
                expand_more
              </span>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 top-full">
                {/* User Info Section */}
                <div className="px-4 py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                      {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name || user.email || "User"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        {(user.role || "unknown").replace(/_/g, " ")}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    to="/me"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 group/item"
                  >
                    <span className="material-symbols-rounded text-lg text-gray-400 group-hover/item:text-blue-600 transition-colors">
                      account_circle
                    </span>
                    <div>
                      <p className="font-medium">My Profile</p>
                      <p className="text-xs text-gray-500">View and edit profile</p>
                    </div>
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 py-2 bg-gray-50">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 group/item"
                  >
                    <span className="material-symbols-rounded text-lg text-red-400 group-hover/item:text-red-600 transition-colors">
                      logout
                    </span>
                    <div className="text-left">
                      <p className="font-medium">Sign Out</p>
                      <p className="text-xs text-red-500">End your session</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2.5 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-110"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-rounded text-gray-700 text-2xl transition-transform duration-300" style={{
              transform: mobileMenuOpen ? "rotate(90deg)" : "rotate(0deg)"
            }}>
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-50 border-t border-gray-200 max-h-[calc(100vh-4rem)] overflow-y-auto animate-in slide-in-from-top-2 duration-300">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 transition-all duration-200"
              >
                <span className="material-symbols-rounded text-lg text-gray-400 group-hover:text-blue-600 transition-colors">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Mobile User Info */}
            <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-md">
                  {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.name || user.email || "User"}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                  <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium capitalize">
                    {(user.role || "unknown").replace(/_/g, " ")}
                  </div>
                </div>
                <span className="material-symbols-rounded text-gray-400 text-lg flex-shrink-0">
                  arrow_forward
                </span>
              </Link>

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-all duration-200"
              >
                <span className="material-symbols-rounded text-lg text-red-400">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      <style>{`
        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}