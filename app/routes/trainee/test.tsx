import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate, useLocation } from "react-router";
import Footer from "~/components/footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface Question {
  id: string;
  text: string;
}

interface AttemptData {
  score: number;
  totalQuestions: number;
  status: "passed" | "failed";
  attemptNumber: number;
}

interface SubmitResponse {
  attempt: AttemptData;
}

export default function SessionQuestionsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract phone from URL or localStorage
  const queryParams = new URLSearchParams(location.search);
  const phoneFromQuery = queryParams.get("phone");
  const [phone, setPhone] = useState<string>(() => phoneFromQuery || localStorage.getItem("traineePhone") || "");
  
  // State management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Attempt state
  const [previousAttempt, setPreviousAttempt] = useState<AttemptData | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<"new" | "passed" | "failed">("new");

  useEffect(() => {
    if (phone) localStorage.setItem("traineePhone", phone);
  }, [phone]);

  useEffect(() => {
    if (!phone) {
      Swal.fire("Missing Info", "No phone number found. Please rejoin the session.", "warning");
      navigate(`/join-session/${id}`);
      return;
    }

    fetchSessionData();
  }, [id, phone, navigate]);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Step 1: Check trainee's attempt status first (using new endpoint)
      const attemptsRes = await axios.get(
        `${API_URL}/sessions/${id}/trainee-attempts?phone=${encodeURIComponent(phone)}`
      );

      const { currentStatus, latestAttempt } = attemptsRes.data;

      // ✅ Step 2: If already passed, redirect immediately
      if (currentStatus === "passed" && latestAttempt) {
        const percentage = ((latestAttempt.score / latestAttempt.totalQuestions) * 100).toFixed(0);
        navigate(`/trainee/session/${id}/result?score=${percentage}&status=passed`, { replace: true });
        return; // Stop execution
      }

      // ✅ Step 3: Get questions (only if not passed)
      const questionsRes = await axios.get(
        `${API_URL}/sessions/${id}/questions?phone=${encodeURIComponent(phone)}`
      );
      setQuestions(questionsRes.data.questions);

      // ✅ Step 4: Set attempt status
      if (currentStatus === "failed" && latestAttempt) {
        setPreviousAttempt(latestAttempt);
        setAttemptStatus("failed");
      } else {
        setAttemptStatus("new");
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to load session data";
      setError(errorMsg);
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: boolean) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      Swal.fire("Incomplete", "Please answer all questions before submitting.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const formattedAnswers = Object.entries(answers).map(([questionId, chosenAnswer]) => ({
        questionId,
        chosenAnswer,
      }));

      const res = await axios.post<SubmitResponse>(
        `${API_URL}/sessions/${id}/test/attempt`,
        {
          phone,
          answers: formattedAnswers,
        }
      );

      if (res.data.attempt) {
        const { score, totalQuestions, status } = res.data.attempt;
        const percentage = ((score / totalQuestions) * 100).toFixed(0);

        Swal.fire({
          title: "Submitted!",
          text: "Your responses were recorded.",
          icon: "success",
          confirmButtonColor: "#2563eb",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        setTimeout(() => {
          navigate(`/trainee/session/${id}/result?score=${percentage}&status=${status}`);
        }, 1500);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to submit answers";
      Swal.fire("Error", errorMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== LOADING STATE ====================
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="h-10 bg-gray-200 rounded w-64 animate-pulse mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="flex gap-6">
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================== ERROR STATE ====================
  if (error && questions.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-2xl">
                  error
                </span>
                <div>
                  <h2 className="text-xl font-bold text-red-900">Failed to Load Questions</h2>
                  <p className="text-red-700 mt-2">{error}</p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================== FAILED STATE - SHOW PREVIOUS SCORE ====================
  if (attemptStatus === "failed" && previousAttempt) {
    const percentage = ((previousAttempt.score / previousAttempt.totalQuestions) * 100).toFixed(0);
    const answeredCount = Object.keys(answers).length;
    const progressPercent = (answeredCount / questions.length) * 100;

    return (
      <div className="bg-gray-50 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-4xl mx-auto">
            {/* Previous Attempt Alert */}
            <div className="bg-gradient-to-br from-amber-50 to-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <span className="material-symbols-rounded text-red-600 flex-shrink-0 text-2xl">
                  info
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 mb-1">Previous Attempt</h3>
                  <p className="text-red-700 text-sm mb-3">
                    You didn't pass this session on your last attempt. Try again to improve your score!
                  </p>
                  <div className="bg-white rounded-lg p-3 border border-red-100">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Score</p>
                        <p className="font-bold text-red-600 mt-1">{percentage}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Questions</p>
                        <p className="font-bold text-gray-900 mt-1">{previousAttempt.score}/{previousAttempt.totalQuestions}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Attempt #</p>
                        <p className="font-bold text-gray-900 mt-1">#{previousAttempt.attemptNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Induction Questions - Retry</h1>
              <p className="text-gray-600">
                Answer all {questions.length} questions to complete the session
              </p>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Progress: {answeredCount} of {questions.length}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-8">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 flex-1">
                      {q.text}
                    </h3>
                  </div>

                  <div className="space-y-3 ml-12">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{
                      backgroundColor: answers[q.id] === true ? "#eff6ff" : "transparent",
                      borderColor: answers[q.id] === true ? "#3b82f6" : "#e5e7eb",
                    }}>
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === true}
                        onChange={() => handleAnswer(q.id, true)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-green-600 text-lg">
                          check_circle
                        </span>
                        <span className="font-medium text-gray-900">True</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{
                      backgroundColor: answers[q.id] === false ? "#fef2f2" : "transparent",
                      borderColor: answers[q.id] === false ? "#ef4444" : "#e5e7eb",
                    }}>
                      <input
                        type="radio"
                        name={q.id}
                        checked={answers[q.id] === false}
                        onChange={() => handleAnswer(q.id, false)}
                        className="w-4 h-4 text-red-600 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-rounded text-red-600 text-lg">
                          cancel
                        </span>
                        <span className="font-medium text-gray-900">False</span>
                      </div>
                    </label>
                  </div>

                  {answers[q.id] !== undefined && (
                    <div className="mt-4 ml-12 flex items-center gap-2 text-xs font-medium text-green-600">
                      <span className="material-symbols-rounded text-sm">done</span>
                      Answered
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky bottom-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {answeredCount === questions.length
                      ? "All questions answered. Ready to submit!"
                      : `${questions.length - answeredCount} question${questions.length - answeredCount !== 1 ? "s" : ""} remaining`}
                  </p>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || answeredCount !== questions.length}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                    submitting || answeredCount !== questions.length
                      ? "bg-gray-400 cursor-not-allowed opacity-60"
                      : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {submitting ? (
                    <>
                      <span className="material-symbols-rounded animate-spin">
                        progress_activity
                      </span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-rounded">send</span>
                      <span>Submit Answers</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ==================== NEW ATTEMPT STATE ====================
  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / questions.length) * 100;

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Induction Questions</h1>
            <p className="text-gray-600">
              Answer all {questions.length} questions to complete the session
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Progress: {answeredCount} of {questions.length}
              </span>
              <span className="text-sm font-semibold text-blue-600">
                {Math.round(progressPercent)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">
                    {q.text}
                  </h3>
                </div>

                <div className="space-y-3 ml-12">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{
                    backgroundColor: answers[q.id] === true ? "#eff6ff" : "transparent",
                    borderColor: answers[q.id] === true ? "#3b82f6" : "#e5e7eb",
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === true}
                      onChange={() => handleAnswer(q.id, true)}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-green-600 text-lg">
                        check_circle
                      </span>
                      <span className="font-medium text-gray-900">True</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors" style={{
                    backgroundColor: answers[q.id] === false ? "#fef2f2" : "transparent",
                    borderColor: answers[q.id] === false ? "#ef4444" : "#e5e7eb",
                  }}>
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === false}
                      onChange={() => handleAnswer(q.id, false)}
                      className="w-4 h-4 text-red-600 cursor-pointer"
                    />
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-red-600 text-lg">
                        cancel
                      </span>
                      <span className="font-medium text-gray-900">False</span>
                    </div>
                  </label>
                </div>

                {answers[q.id] !== undefined && (
                  <div className="mt-4 ml-12 flex items-center gap-2 text-xs font-medium text-green-600">
                    <span className="material-symbols-rounded text-sm">done</span>
                    Answered
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 sticky bottom-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {answeredCount === questions.length
                    ? "All questions answered. Ready to submit!"
                    : `${questions.length - answeredCount} question${questions.length - answeredCount !== 1 ? "s" : ""} remaining`}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={submitting || answeredCount !== questions.length}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                  submitting || answeredCount !== questions.length
                    ? "bg-gray-400 cursor-not-allowed opacity-60"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                }`}
              >
                {submitting ? (
                  <>
                    <span className="material-symbols-rounded animate-spin">
                      progress_activity
                    </span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-rounded">send</span>
                    <span>Submit Answers</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}