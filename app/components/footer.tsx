import { Link } from "react-router";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-11 h-11 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Adamus Inductions Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                Adamus Resources Limited
              </span>
            </Link>
            <p className="text-sm text-gray-600">
              Training excellence and employee development platform
            </p>
          </div>

          {/* Company */}
          
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">
            &copy; {currentYear}{" "}
            <Link to="/" className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              Adamus Resources Limited
            </Link>
            . All Rights Reserved.
          </p>
        </div>
        </div>
      </div>
    </footer>
  );
}