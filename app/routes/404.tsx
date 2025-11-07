import React from "react";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

export default function NotFound() {
  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div>
      <Title title="Page Not Found" />

      <main className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Animated 404 Background */}
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute w-64 h-64 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
                <div className="absolute w-48 h-48 bg-blue-300 rounded-full opacity-10 blur-2xl animate-pulse" style={{ animationDelay: "0.5s" }}></div>
              </div>

              <div className="relative">
                <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400 animate-bounce" style={{ animationDuration: "3s" }}>
                  404
                </div>
              </div>
            </div>

            {/* Icon */}
            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 border-2 border-blue-200">
              <span className="material-symbols-rounded text-5xl text-blue-600">
                sentiment_dissatisfied
              </span>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                Oops! Page Not Found
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto mb-2">
                We couldn't find the page you're looking for.
              </p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                The page might have been moved, deleted, or never existed.
              </p>
            </div>

            {/* Suggestion Box */}
            <div className="mb-10 w-full max-w-md bg-white rounded-xl border-2 border-blue-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="material-symbols-rounded text-blue-600 flex-shrink-0 mt-1">
                  lightbulb
                </span>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 mb-1">Did you mean?</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Check the URL for typos</li>
                    <li>• Navigate using the menu</li>
                    <li>• Return to the homepage</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                onClick={() => handleNavigation("/")}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                <span className="material-symbols-rounded">home</span>
                Go Home
              </button>
              <button
                onClick={handleGoBack}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-all hover:shadow-lg active:scale-95"
              >
                <span className="material-symbols-rounded">arrow_back</span>
                Go Back
              </button>
            </div>

            {/* Decorative Elements */}
            <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-full"></div>
              <div className="flex justify-center">
                <span className="material-symbols-rounded text-gray-300 text-2xl">
                  error
                </span>
              </div>
              <div className="h-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent rounded-full"></div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}