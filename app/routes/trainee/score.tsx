// app/routes/trainee.session.$id.result.tsx
import { useSearchParams, useParams } from "react-router";
import Footer from "~/components/footer";

export default function SessionResultPage() {
  const [params] = useSearchParams();
  const { id } = useParams();

  const score = parseInt(params.get("score") || "0", 10);
  const status = (params.get("status") || "").toLowerCase();
  const isPassed = status === "passed";

  // Determine score color and icon
  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBackground = () => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              {isPassed ? (
                <div className="bg-green-100 p-5 rounded-2xl animate-bounce">
                  <span className="material-symbols-rounded text-5xl text-green-600">
                    check_circle
                  </span>
                </div>
              ) : (
                <div className="bg-red-100 p-5 rounded-2xl">
                  <span className="material-symbols-rounded text-5xl text-red-600">
                    cancel
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {isPassed ? "Congratulations!" : "Session Complete"}
            </h1>
            <p className="text-gray-600 text-lg">
              Your results for session #{id}
            </p>
          </div>

          {/* Main Score Card */}
          <div className={`rounded-xl border p-8 mb-8 text-center ${getScoreBackground()}`}>
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Your Score
            </p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="text-7xl font-bold">
                <span className={getScoreColor()}>{score}</span>
                <span className="text-4xl text-gray-400">%</span>
              </div>
            </div>
            <div className="h-1 bg-gray-200 rounded-full mx-auto max-w-xs mb-4">
              <div
                className={`h-1 rounded-full transition-all duration-500 ${
                  score >= 80 ? "bg-green-600" : score >= 60 ? "bg-yellow-600" : "bg-red-600"
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-8 flex justify-center">
            <div
              className={`inline-flex items-center gap-2.5 px-6 py-3 rounded-full font-semibold text-base ${
                isPassed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <span className="material-symbols-rounded text-xl">
                {isPassed ? "check_circle" : "cancel"}
              </span>
              <span>{isPassed ? "PASSED" : "FAILED"}</span>
            </div>
          </div>

          {/* Results Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <span className="material-symbols-rounded text-blue-600">
                assessment
              </span>
              Results Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                  Score
                </p>
                <p className={`text-4xl font-bold ${getScoreColor()}`}>
                  {score}%
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                  Status
                </p>
                <p className={`text-2xl font-bold ${isPassed ? "text-green-600" : "text-red-600"}`}>
                  {isPassed ? "PASSED" : "FAILED"}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 uppercase tracking-wide font-medium mb-2">
                  Session ID
                </p>
                <p className="text-sm font-mono text-gray-900 break-all">
                  {id}
                </p>
              </div>
            </div>
          </div>

          {/* Message Card */}
          <div className={`rounded-xl border p-6 mb-8 ${
            isPassed
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}>
            <div className="flex items-start gap-4">
              <span className={`material-symbols-rounded flex-shrink-0 text-2xl ${
                isPassed ? "text-green-600" : "text-red-600"
              }`}>
                {isPassed ? "mood" : "sentiment_very_dissatisfied"}
              </span>
              <div>
                <h3 className={`font-bold text-lg mb-2 ${
                  isPassed ? "text-green-900" : "text-red-900"
                }`}>
                  {isPassed
                    ? "Excellent Work!"
                    : "Keep Learning!"}
                </h3>
                <p className={`text-sm ${
                  isPassed ? "text-green-700" : "text-red-700"
                }`}>
                  {isPassed
                    ? "Congratulations! You've successfully completed this session. Your score demonstrates a solid understanding of the material."
                    : "You didn't quite pass this time. Review the material and try again."}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 mb-8">

            {!isPassed && (
              <button
                onClick={() => window.history.back()}
                className="w-full py-4 px-6 rounded-lg font-semibold text-blue-600 transition-all flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 active:scale-95 shadow-sm"
              >
                <span className="material-symbols-rounded">refresh</span>
                <span>Try Again</span>
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}