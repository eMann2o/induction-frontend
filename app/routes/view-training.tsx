import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

/* -------------------------------------------------------------------------- */
/* 🧩 Types                                                                  */
/* -------------------------------------------------------------------------- */
interface Question {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface QuestionSet {
  _id: string;
  version: number;
  questions: Question[];
}

interface Training {
  _id: string;
  title: string;
  description?: string;
  passMark?: number;
  currentQuestionSet?: {
    _id: string;
    version: number;
  };
  sessionDate?: string;
  createdAt?: string;
}

interface TrainingResponse {
  success: boolean;
  training: Training;
}

interface QuestionSetResponse {
  success: boolean;
  questionSet: QuestionSet;
}

/* -------------------------------------------------------------------------- */
/* 🎨 UI Helpers (Improved Loading/Error States)                             */
/* -------------------------------------------------------------------------- */

/**
 * ✅ Modern Skeleton Loader for improved UX.
 * Mimics the final layout to prevent CLS (Layout Shift).
 */
const TrainingDetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl animate-pulse">
    {/* Title & Description Skeleton */}
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-3 mt-4"></div>
      <div className="h-4 bg-gray-100 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left Column (Main Content) Skeleton */}
      <div className="lg:col-span-2">
        {/* Overview Card Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
          <div className="h-6 bg-gray-200 rounded-lg w-1/3 mb-6"></div>
          <div className="space-y-5">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-3 bg-gray-100 rounded-md w-1/4 mb-1"></div>
                <div className="h-5 bg-gray-200 rounded-lg w-1/2"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Questions Card Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 mt-8">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4 mb-6"></div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-md border border-gray-100 p-4">
                <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

/**
 * ✅ Styled Not Found State for better UX.
 */
const TrainingNotFound: React.FC = () => (
  <div className="mx-auto max-w-7xl text-center py-20">
    <div className="inline-flex rounded-full bg-red-100 p-4">
      <span className="material-symbols-rounded text-red-600 text-4xl">
        sentiment_dissatisfied
      </span>
    </div>
    <h3 className="mt-4 text-2xl font-semibold text-gray-900">
      Induction Not Found
    </h3>
    <p className="mt-2 text-gray-500">
      We couldn't find a training session with that ID.
    </p>
    <div className="mt-6">
      <Link
        to="/admin/trainings"
        className="inline-flex items-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
      >
        <span className="material-symbols-rounded -ml-1 mr-2 text-lg">
          arrow_back
        </span>
        Back to Trainings List
      </Link>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* 🧩 Main Component                                                        */
/* -------------------------------------------------------------------------- */
export default function ViewTraining() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Fetch Induction + Questions                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    // Immediate check for missing ID
    if (!id) {
        setLoading(false);
        setTraining(null);
        return;
    }

    const fetchTrainingAndQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authorization token missing. Please log in.");

        // 1️⃣ Fetch training by ID
        const trainingRes = await axios.get<TrainingResponse>(
          `${import.meta.env.VITE_API_BASE_URL}/trainings/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!trainingRes.data.success || !trainingRes.data.training)
          throw new Error("Induction data not available.");

        const fetchedTraining = trainingRes.data.training;
        setTraining(fetchedTraining);

        // 2️⃣ Fetch related question set (if exists)
        if (fetchedTraining.currentQuestionSet?._id) {
          const questionSetRes = await axios.get<QuestionSetResponse>(
            `${import.meta.env.VITE_API_BASE_URL}/questionsets/${fetchedTraining.currentQuestionSet._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (questionSetRes.data.success) {
            setQuestionSet(questionSetRes.data.questionSet);
          }
        }
      } catch (err) {
        // Log to console for debugging
        console.error("Fetch error:", err);

        const message =
          (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
          (err as Error).message ||
          "Failed to fetch training details.";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          confirmButtonColor: "#ef4444",
        });
        // Important: Set training to null on failure so the Not Found component renders
        setTraining(null); 
      } finally {
        setLoading(false);
      }
    };

    void fetchTrainingAndQuestions();
  }, [id]);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Loading/Error Render                                                   */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <>
        <AdminNavbar />
      <Title title="Induction Details" />
        <main className="flex-1 min-h-screen bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
          <TrainingDetailSkeleton />
        </main>
        <Footer />
      </>
    );

  if (!training)
    return (
      <>
        <AdminNavbar />
      <Title title="Induction Details" />
        <main className="flex-1 min-h-screen bg-gray-50 px-4 py-20 sm:px-6 lg:px-8">
          <TrainingNotFound />
        </main>
        <Footer />
      </>
    );

  /* -------------------------------------------------------------------------- */
  /* 🧩 Main Render                                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title="Induction Details" />

      <main className="flex-1 min-h-screen bg-gray-50 text-gray-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 border-b border-gray-200 pb-4">
            <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
              {training.title}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {training.description || "No description provided for this training."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-1">
            <div className="lg:col-span-2">
              {/* Induction Overview Card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                    <span className="material-symbols-rounded text-blue-600 text-xl">info</span>
                    Induction Overview
                </h2>

                <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-gray-400">check_circle</span>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Pass Mark
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {training.passMark ?? "N/A"}%
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-gray-400">compare_arrows</span>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Question Version
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {training.currentQuestionSet?.version ? `v${training.currentQuestionSet.version}` : "—"}
                      </dd>
                    </div>
                  </div>

                  {training.sessionDate && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-gray-400">calendar_month</span>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Session Date
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {new Date(training.sessionDate).toLocaleDateString()}
                        </dd>
                      </div>
                    </div>
                  )}

                  {training.createdAt && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-rounded text-gray-400">add_task</span>
                      <div>
                        <dt className="text-sm font-medium text-gray-500">
                          Created On
                        </dt>
                        <dd className="text-lg font-semibold text-gray-900">
                          {new Date(training.createdAt).toLocaleDateString()}
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              {/* Question List Card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6 mt-8">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                    <span className="material-symbols-rounded text-blue-600 text-xl">quiz</span>
                    Question Set
                </h2>

                {!questionSet || !questionSet.questions?.length ? (
                  <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <span className="material-symbols-rounded align-bottom text-orange-500 text-lg mr-1">warning</span>
                    No active question set is associated with this training.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {(questionSet?.questions ?? []).map((q, index) => (
                      <div
                        key={q._id}
                        className="rounded-xl border border-gray-200 p-5 bg-gray-50 transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        <p className="text-base font-semibold text-gray-800 mb-3">
                          <span className="text-blue-600 font-extrabold mr-2">
                            {index + 1}.
                          </span>
                          {q.questionText}
                        </p>

                        <div className="border-t border-gray-100 pt-3">
                          <p className="text-sm text-gray-700">
                            <strong className="font-semibold text-green-700 mr-2">
                                <span className="material-symbols-rounded align-text-bottom text-sm">check_box</span>
                                Correct Answer:
                            </strong>
                            {q.correctAnswer ? "True" : "False"}
                          </p>
                          {q.explanation && (
                             <p className="mt-1 text-xs text-gray-500 italic">
                               <span className="material-symbols-rounded align-text-bottom text-xs">lightbulb</span>
                               <span className="ml-1">Explanation: {q.explanation}</span>
                             </p>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 text-center pt-4">
                        End of Question Set (Total: {questionSet.questions.length} Questions)
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}