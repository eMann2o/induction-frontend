import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

const API_URL = import.meta.env.VITE_API_BASE_URL;

/* -------------------------------------------------------------------------- */
/* 🧩 Types                                                                  */
/* -------------------------------------------------------------------------- */
interface Question {
  _id?: string;
  questionText?: string;
  text?: string;
  options?: string[];
  correctAnswer: boolean | string;
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
  updatedAt?: string;
}

interface TrainingResponse {
  success: boolean;
  training: Training;
}

interface QuestionSetResponse {
  success: boolean;
  questionSet: QuestionSet;
}

interface EditFormData {
  title: string;
  description: string;
  passMark: number | "";
  questions: Question[];
}

/* -------------------------------------------------------------------------- */
/* 🎨 UI Helpers                                                              */
/* -------------------------------------------------------------------------- */

const TrainingDetailSkeleton: React.FC = () => (
  <div className="mx-auto max-w-7xl animate-pulse">
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded-lg w-3/4 mb-3 mt-4"></div>
      <div className="h-4 bg-gray-100 rounded-md w-full mb-2"></div>
      <div className="h-4 bg-gray-100 rounded-md w-2/3"></div>
    </div>

    <div className="space-y-8">
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

      <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
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
);

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
      We couldn't find an induction session with that ID.
    </p>
    <div className="mt-6">
    </div>
  </div>
);

function QuestionInput({
  question,
  index,
  onUpdate,
  onRemove,
}: {
  question: Question;
  index: number;
  onUpdate: (index: number, question: Question) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          Question {index + 1}
        </span>
        <button
          onClick={() => onRemove(index)}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          <span className="material-symbols-rounded text-lg">delete</span>
        </button>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">
          Question Text
        </label>
        <textarea
          value={question.text || question.questionText || ""}
          onChange={(e) =>
            onUpdate(index, { ...question, text: e.target.value })
          }
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter question text"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-xs font-medium text-gray-600 mb-3">Correct Answer</p>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => onUpdate(index, { ...question, correctAnswer: true })}
            className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all border-2 ${
              question.correctAnswer === true
                ? "bg-green-100 border-green-500 text-green-700"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:border-green-300"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-rounded text-lg">check_circle</span>
              True
            </span>
          </button>
          <button
            type="button"
            onClick={() => onUpdate(index, { ...question, correctAnswer: false })}
            className={`flex-1 py-2 px-3 rounded-md font-medium text-sm transition-all border-2 ${
              question.correctAnswer === false
                ? "bg-red-100 border-red-500 text-red-700"
                : "bg-gray-100 border-gray-300 text-gray-700 hover:border-red-300"
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-rounded text-lg">cancel</span>
              False
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🧩 Main Component                                                         */
/* -------------------------------------------------------------------------- */
export default function ViewTraining() {
  const { id } = useParams<{ id: string }>();
  const [training, setTraining] = useState<Training | null>(null);
  const [questionSet, setQuestionSet] = useState<QuestionSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "questions">(
    "details"
  );

  const [formData, setFormData] = useState<EditFormData>({
    title: "",
    description: "",
    passMark: "",
    questions: [],
  });

  /* -------------------------------------------------------------------------- */
  /* 🧩 Fetch Training + Questions                                              */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setTraining(null);
      return;
    }

    const fetchTrainingAndQuestions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authorization token missing. Please log in.");

        const trainingRes = await axios.get<TrainingResponse>(
          `${API_URL}/trainings/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!trainingRes.data.success || !trainingRes.data.training)
          throw new Error("Induction data not available.");

        const fetchedTraining = trainingRes.data.training;
        setTraining(fetchedTraining);

        // Initialize form data with empty question for new ones
        setFormData({
          title: fetchedTraining.title,
          description: fetchedTraining.description || "",
          passMark: fetchedTraining.passMark || "",
          questions: [{ text: "", correctAnswer: false }],
        });

        // Fetch question set if exists
        if (fetchedTraining.currentQuestionSet?._id) {
          const questionSetRes = await axios.get<QuestionSetResponse>(
            `${API_URL}/questionsets/${fetchedTraining.currentQuestionSet._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (questionSetRes.data.success && questionSetRes.data.questionSet?.questions) {
            setQuestionSet(questionSetRes.data.questionSet);
            // Pre-populate form with existing questions when entering edit mode
            const existingQuestions = questionSetRes.data.questionSet.questions.map((q) => ({
              _id: q._id,
              text: q.questionText || q.text || "",
              questionText: q.questionText || "",
              correctAnswer: q.correctAnswer === true || q.correctAnswer === "true",
            }));
            // Store existing questions separately so we can show them when editing
            setFormData((prev) => ({
              ...prev,
              questions: existingQuestions,
            }));
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);

        const message =
          (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
          (err as Error).message ||
          "Failed to fetch induction details.";

        Swal.fire({
          icon: "error",
          title: "Error",
          text: message,
          confirmButtonColor: "#ef4444",
        });
        setTraining(null);
      } finally {
        setLoading(false);
      }
    };

    void fetchTrainingAndQuestions();
  }, [id]);

  /* -------------------------------------------------------------------------- */
  /* 🧩 Edit Handlers                                                           */
  /* -------------------------------------------------------------------------- */

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "passMark" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleQuestionUpdate = (index: number, question: Question) => {
    setFormData((prev) => {
      const questions = [...prev.questions];
      questions[index] = question;
      return { ...prev, questions };
    });
  };

  const handleAddQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { text: "", correctAnswer: false }],
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    try {
      if (!formData.title.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Title is required",
        });
        return;
      }

      if (
        formData.passMark !== "" &&
        (Number(formData.passMark) < 0 || isNaN(Number(formData.passMark)))
      ) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Pass mark must be a positive number",
        });
        return;
      }

      setIsSaving(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      // Save training details
      const trainingRes = await axios.put<TrainingResponse>(
        `${API_URL}/trainings/${id}`,
        {
          title: formData.title,
          description: formData.description || undefined,
          passMark:
            formData.passMark === "" ? undefined : Number(formData.passMark),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (!trainingRes.data.success) throw new Error("Failed to update induction");

      // Save questions if any exist and have text
      const validQuestions = formData.questions.filter((q) =>
        (q.text || q.questionText)?.trim()
      );

      if (validQuestions.length > 0) {
        const questionsRes = await axios.post(
          `${API_URL}/trainings/${id}/questions`,
          {
            questions: validQuestions.map((q) => ({
              text: q.text || q.questionText || "",
              correctAnswer: q.correctAnswer === true || q.correctAnswer === "true",
            })),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        if (!questionsRes.data.success) throw new Error(questionsRes.data.message);
      }

      setTraining(trainingRes.data.training);
      setIsEditing(false);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Induction updated successfully",
        confirmButtonColor: "#3b82f6",
      });
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        (err as Error).message ||
        "Failed to save induction";

      Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (training) {
      // Reload form data - if there are existing questions, show them, otherwise empty
      if (questionSet && questionSet.questions.length > 0) {
        const existingQuestions = questionSet.questions.map((q) => ({
          _id: q._id,
          text: q.questionText || q.text || "",
          questionText: q.questionText || "",
          correctAnswer: q.correctAnswer === true || q.correctAnswer === "true",
        }));
        setFormData({
          title: training.title,
          description: training.description || "",
          passMark: training.passMark || "",
          questions: existingQuestions,
        });
      } else {
        setFormData({
          title: training.title,
          description: training.description || "",
          passMark: training.passMark || "",
          questions: [{ text: "", correctAnswer: false }],
        });
      }
    }
    setIsEditing(false);
    setActiveTab("details");
  };

  /* -------------------------------------------------------------------------- */
  /* 🧩 Render States                                                           */
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
  /* 🧩 Main Render                                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title={isEditing ? "Edit Induction" : "Induction Details"} />

      <main className="flex-1 min-h-screen bg-gray-50 text-gray-800 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-10 border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="text-4xl font-extrabold text-gray-900 bg-white border border-gray-300 rounded-lg px-4 py-3 mb-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Induction title"
                />
              ) : (
                <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
                  {training.title}
                </h1>
              )}
              {isEditing ? (
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-2 w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-600 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter inducion description"
                />
              ) : (
                <p className="mt-2 text-lg text-gray-600">
                  {training.description || "No description provided for this induction."}
                </p>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <span className="material-symbols-rounded">edit</span>
                Edit Induction
              </button>
            )}
          </div>

          <div className="space-y-8">
            {/* Training Overview Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                <span className="material-symbols-rounded text-blue-600 text-xl">
                  info
                </span>
                Induction Overview
              </h2>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded text-gray-400">
                    check_circle
                  </span>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Pass Mark
                    </dt>
                    {isEditing ? (
                      <input
                        type="number"
                        name="passMark"
                        value={formData.passMark}
                        onChange={handleInputChange}
                        min="0"
                        className="text-lg font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter pass mark"
                      />
                    ) : (
                      <dd className="text-lg font-semibold text-gray-900">
                        {training.passMark ?? "N/A"}%
                      </dd>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="material-symbols-rounded text-gray-400">
                    compare_arrows
                  </span>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Question Version
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {training.currentQuestionSet?.version
                        ? `v${training.currentQuestionSet.version}`
                        : "—"}
                    </dd>
                  </div>
                </div>

                {training.sessionDate && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-rounded text-gray-400">
                      calendar_month
                    </span>
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
                    <span className="material-symbols-rounded text-gray-400">
                      add_task
                    </span>
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

            {/* Questions Card */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-lg p-6">
              {isEditing && (
                <div className="border-b border-gray-200 mb-6 pb-4 flex items-center justify-between">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "details"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-lg">
                        info
                      </span>
                      Details
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab("questions")}
                    className={`py-2 px-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "questions"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-rounded text-lg">
                        quiz
                      </span>
                      Questions ({formData.questions.length})
                    </span>
                  </button>
                </div>
              )}

              {/* Questions Section */}
              {(!isEditing || activeTab === "questions") && (
                <div>
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                    <span className="material-symbols-rounded text-blue-600 text-xl">
                      quiz
                    </span>
                    Question Set
                  </h2>

                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {formData.questions.some((q) => q._id)
                              ? "Modify Existing Questions or Add New Ones"
                              : "Add Questions"}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {formData.questions.some((q) => q._id)
                              ? "Edit existing questions or add more to this induction"
                              : "Add questions for this induction"}
                          </p>
                        </div>
                        <button
                          onClick={handleAddQuestion}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          <span className="material-symbols-rounded">add</span>
                          Add Question
                        </button>
                      </div>

                      <div className="space-y-4">
                        {formData.questions.map((question, index) => (
                          <QuestionInput
                            key={index}
                            question={question}
                            index={index}
                            onUpdate={handleQuestionUpdate}
                            onRemove={handleRemoveQuestion}
                          />
                        ))}
                      </div>

                      {formData.questions.length === 0 && (
                        <div className="text-center py-8">
                          <span className="material-symbols-rounded text-4xl text-gray-300 inline-block mb-2">
                            help
                          </span>
                          <p className="text-gray-500">
                            No questions yet. Add one to get started.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {!questionSet || !questionSet.questions?.length ? (
                        <p className="text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                          <span className="material-symbols-rounded align-bottom text-orange-500 text-lg mr-1">
                            warning
                          </span>
                          No active question set is associated with this induction.
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
                                {q.questionText || q.text}
                              </p>

                              <div className="border-t border-gray-100 pt-3">
                                <p className="text-sm text-gray-700">
                                  <strong className="font-semibold text-green-700 mr-2">
                                    <span className="material-symbols-rounded align-text-bottom text-sm">
                                      check_box
                                    </span>
                                    Correct Answer:
                                  </strong>
                                  {q.correctAnswer ? "True" : "False"}
                                </p>
                                {q.explanation && (
                                  <p className="mt-1 text-xs text-gray-500 italic">
                                    <span className="material-symbols-rounded align-text-bottom text-xs">
                                      lightbulb
                                    </span>
                                    <span className="ml-1">
                                      Explanation: {q.explanation}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          <p className="text-sm text-gray-500 text-center pt-4">
                            End of Question Set (Total:{" "}
                            {questionSet.questions.length} Questions)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <span className="material-symbols-rounded">
                      {isSaving ? "hourglass_empty" : "save"}
                    </span>
                    {isSaving ? "Saving..." : "Save All Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 px-6 py-2.5 rounded-lg font-medium transition-colors"
                  >
                    <span className="material-symbols-rounded">close</span>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}