import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

/* -------------------------------------------------------------------------- */
/* 🧩 Types                                                                  */
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
/* 🧩 Component                                                              */
/* -------------------------------------------------------------------------- */
export default function ViewTraining() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Fetch Induction + Questions                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchTrainingAndQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authorization token missing.");

        // 1️⃣ Fetch training by ID
        const trainingRes = await axios.get<TrainingResponse>(
          `http://localhost:3000/trainings/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!trainingRes.data.success)
          throw new Error("Failed to load training.");

        const fetchedTraining = trainingRes.data.training;
        setTraining(fetchedTraining);

        // 2️⃣ Fetch related question set (if exists)
        if (fetchedTraining.currentQuestionSet?._id) {
          const questionSetRes = await axios.get<QuestionSetResponse>(
            `http://localhost:3000/questionsets/${fetchedTraining.currentQuestionSet._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (questionSetRes.data.success) {
            setQuestionSet(questionSetRes.data.questionSet);
          }
        }
      } catch (err) {
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
      } finally {
        setLoading(false);
      }
    };

    void fetchTrainingAndQuestions();
  }, [id]);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Loading States                                                         */
  /* -------------------------------------------------------------------------- */
  if (loading)
    return (
      <div className="p-12 text-center text-gray-600 animate-pulse">
        Loading training details...
      </div>
    );

  if (!training)
    return (
      <div className="p-12 text-center text-gray-500">Induction not found.</div>
    );

  /* -------------------------------------------------------------------------- */
  /* 🧩 Render                                                                */
  /* -------------------------------------------------------------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title="Induction Details" />

      <main className="flex-1 min-h-screen bg-background-light text-gray-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <Link
              to="/admin/trainings"
              className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Trainings
            </Link>
            <h1 className="mt-4 text-3xl font-bold text-gray-900">
              {training.title}
            </h1>
            <p className="mt-2 text-gray-600">
              {training.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* -------- Left Column -------- */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Induction Overview
                </h2>

                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Pass Mark
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {training.passMark ?? "N/A"}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Version
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {training.currentQuestionSet?.version ?? "—"}
                    </dd>
                  </div>

                  {training.sessionDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Session Date
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {new Date(training.sessionDate).toLocaleDateString()}
                      </dd>
                    </div>
                  )}

                  {training.createdAt && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Created On
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        {new Date(training.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* -------- Question List -------- */}
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6 mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Question Set
                </h2>

                {!questionSet || !questionSet.questions?.length ? (
                  <p className="text-gray-500 italic">
                    No question set available.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {(questionSet?.questions ?? []).map((q, index) => (
  <div key={q._id} className="rounded-md border border-gray-200 p-4">
    <p className="font-medium text-gray-800">
      {index + 1}. {q.questionText}
    </p>

    <p className="mt-2 text-sm">
      <strong>Answer:</strong>{" "}
      <span
        className={
          q.correctAnswer ? "text-green-600 font-semibold" : "text-red-600 font-semibold"
        }
      >
        {q.correctAnswer ? "True" : "False"}
      </span>
    </p>
  </div>
))}

                  </div>
                )}
              </div>
            </div>

            {/* -------- Right Column -------- */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to={`/admin/trainings/${id}/sessions`}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    <span className="material-symbols-outlined text-base">
                      event
                    </span>
                    View Sessions
                  </Link>

                  <Link
                    to="/admin/dashboard"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200"
                  >
                    <span className="material-symbols-outlined text-base">
                      dashboard
                    </span>
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
