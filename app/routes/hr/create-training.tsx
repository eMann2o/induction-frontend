// CreateTraining.tsx
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";

type Question = {
  text: string;
  correctAnswer: boolean | null;
};

export default function CreateTraining() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [passMark, setPassMark] = useState<number | "">("");
  const [questions, setQuestions] = useState<Question[]>([]);

  // Local inputs for adding a new question
  const [newQuestionText, setNewQuestionText] = useState<string>("");
  const [newQuestionAnswer, setNewQuestionAnswer] = useState<boolean | null>(null);

  /* -------------------- Question CRUD -------------------- */

  const addQuestion = () => {
    if (!newQuestionText.trim() || newQuestionAnswer === null) {
      Swal.fire("Incomplete question", "Please add question text and select True/False.", "warning");
      return;
    }

    setQuestions((prev) => [...prev, { text: newQuestionText.trim(), correctAnswer: newQuestionAnswer }]);
    setNewQuestionText("");
    setNewQuestionAnswer(null);
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const editQuestion = async (index: number) => {
    const q = questions[index];
    // Use SweetAlert2 modal with simple HTML inputs and then read values from DOM
    const { value: formValues } = await Swal.fire({
      title: `Edit question ${index + 1}`,
      html: `
        <div style="text-align:left">
          <label for="swal-q-text" style="display:block; font-weight:600; margin-bottom:6px">Question</label>
          <textarea id="swal-q-text" class="swal2-textarea" rows="4" style="width:100%">${escapeHtml(q.text)}</textarea>
          <div style="margin-top:12px; display:flex; gap:8px; align-items:center;">
            <label style="display:flex; gap:6px; align-items:center;">
              <input type="radio" name="swal-q-answer-${index}" value="true" ${q.correctAnswer === true ? "checked" : ""}/>
              <span>True</span>
            </label>
            <label style="display:flex; gap:6px; align-items:center;">
              <input type="radio" name="swal-q-answer-${index}" value="false" ${q.correctAnswer === false ? "checked" : ""}/>
              <span>False</span>
            </label>
          </div>
        </div>
      `,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const textEl = (document.getElementById("swal-q-text") as HTMLTextAreaElement | null);
        const radios = Array.from(document.getElementsByName(`swal-q-answer-${index}`)) as HTMLInputElement[];
        const selected = radios.find((r) => r.checked);
        return {
          text: textEl?.value ?? "",
          answer: selected ? selected.value : null,
        };
      },
    });

    if (!formValues) return;

    const { text, answer } = formValues as { text: string; answer: string | null };

    if (!text.trim() || answer === null) {
      Swal.fire("Invalid", "Question text and answer are required.", "warning");
      return;
    }

    const updated = [...questions];
    updated[index] = { text: text.trim(), correctAnswer: answer === "true" };
    setQuestions(updated);
    Swal.fire("Saved", "Question updated.", "success");
  };

  /* -------------------- Validation -------------------- */

  const validateBeforeSubmit = (): { valid: boolean; message?: string } => {
    if (!title.trim()) return { valid: false, message: "Induction title is required." };
    if (passMark === "" || passMark === null) return { valid: false, message: "Pass mark is required." };
    const totalQuestions = questions.length;
    if (totalQuestions === 0) return { valid: false, message: "Add at least one question before publishing." };
    if (typeof passMark === "number" && passMark > totalQuestions) {
      return { valid: false, message: "Pass mark cannot exceed the total number of questions." };
    }
    // ensure each question has text & an answer
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return { valid: false, message: `Question ${i + 1} has no text.` };
      if (q.correctAnswer === null) return { valid: false, message: `Question ${i + 1} has no selected answer.` };
    }

    return { valid: true };
  };

  /* -------------------- Submit Flow -------------------- */

  const handleCreateAndAdd = async (): Promise<void> => {
    const validation = validateBeforeSubmit();
    if (!validation.valid) {
      Swal.fire("Validation", validation.message || "Invalid input", "warning");
      return;
    }

    try {
      const token = localStorage.getItem("token") ?? "";
      Swal.fire({
        title: "Creating training...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      // Create training
      const trainingRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/trainings`,
        {
          title: title.trim(),
          description: description.trim(),
          passMark: Number(passMark),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // backend returns training.id per your implementation
      const trainingId: string | undefined =
        trainingRes.data?.training?.id ?? trainingRes.data?.training?._id ?? trainingRes.data?.training;

      if (!trainingId) {
        Swal.close();
        Swal.fire("Error", "Induction ID was not returned by the server.", "error");
        return;
      }

      // prepare questions payload (map to expected backend fields)
      const payloadQuestions = questions.map((q) => ({
        text: q.text,
        correctAnswer: q.correctAnswer,
      }));

      // add questions
      const questionsRes = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/trainings/${trainingId}/questions`,
        { questions: payloadQuestions },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.close();

      if (questionsRes.data?.success) {
        await Swal.fire("Success", "Induction and questions created successfully.", "success");
        // reset form
        setTitle("");
        setDescription("");
        setPassMark("");
        setQuestions([]);
        setNewQuestionText("");
        setNewQuestionAnswer(null);
      } else {
        Swal.fire("Partial success", "Induction created but adding questions failed.", "warning");
      }
    } catch (err: any) {
      Swal.close();
      const message = err?.response?.data?.message ?? err.message ?? "Server error";
      Swal.fire("Error", message, "error");
    }
  };

  /* -------------------- Render -------------------- */

  return (
    <div>
      <AdminNavbar />
      <Title title="Create Induction" />
      <div className="bg-background-light font-display py-20 text-gray-800">
        <div className="flex min-h-screen w-full flex-col">
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Create Induction + Questions</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Define the training program and add questions for the assessment.
                </p>
              </div>

              {/* Section 1 */}
              <div className="rounded-lg border border-gray-200 bg-background-light p-6 shadow-sm mb-12">
                <h2 className="text-xl font-semibold text-gray-900">Section 1: Induction Information</h2>
                <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-900">Induction Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Safety Compliance 101"
                      className="mt-2 block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-sm font-medium text-gray-900">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Short description of the training..."
                      className="mt-2 block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-sm font-medium text-gray-900">Pass Mark</label>
                    <input
                      type="number"
                      value={passMark}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPassMark(v === "" ? "" : Number(v));
                      }}
                      placeholder="e.g., 4"
                      className="mt-2 block w-full rounded-md border-0 p-2.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary sm:text-sm"
                    />
                    <p className="mt-2 text-sm text-gray-500">Pass mark must be ≤ total questions.</p>
                  </div>
                </div>
              </div>

              {/* Questions */}
              <div className="flex flex-col gap-8 lg:flex-row">
                <div className="w-full lg:w-1/2">
                  <div className="rounded-lg border border-gray-200 bg-background-light p-6 shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900">Section 2: Add Questions</h2>
                    <p className="mt-1 text-sm text-gray-600">Create the questions for the training assessment.</p>

                    <div className="mt-6 space-y-6">
                      {/* New question inputs */}
                      <div className="rounded-md border border-gray-200 p-4">
                        <label className="block text-sm font-medium text-gray-900">Question Text</label>
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          className="mt-2 block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-primary sm:text-sm"
                          placeholder="Type a new question..."
                        />
                        <div className="mt-3 flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="new-answer"
                              checked={newQuestionAnswer === true}
                              onChange={() => setNewQuestionAnswer(true)}
                            />
                            <span>True</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="new-answer"
                              checked={newQuestionAnswer === false}
                              onChange={() => setNewQuestionAnswer(false)}
                            />
                            <span>False</span>
                          </label>
                        </div>

                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => {
                              setNewQuestionText("");
                              setNewQuestionAnswer(null);
                            }}
                            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            type="button"
                          >
                            Clear
                          </button>

                          <button
                            onClick={addQuestion}
                            className="ml-auto flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-base">add_circle</span>
                            <span>Add Question</span>
                          </button>
                        </div>
                      </div>

                      {/* Existing questions list (editable blocks) */}
                      {questions.map((q, idx) => (
                        <div key={idx} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{idx + 1}. {q.text || <em className="text-gray-400">No text</em>}</p>
                              <p className="text-sm mt-1">
                                <span className="font-semibold">Answer:</span>{" "}
                                {q.correctAnswer === null ? <span className="text-gray-500">Not selected</span> : q.correctAnswer ? <span className="text-green-600">True</span> : <span className="text-red-600">False</span>}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => editQuestion(idx)}
                                className="p-2 text-gray-500 hover:text-primary"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => deleteQuestion(idx)}
                                className="p-2 text-red-500 hover:text-red-700"
                                type="button"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="w-full lg:w-1/2">
                  <div className="rounded-lg border border-gray-200 bg-background-light p-6 shadow-sm h-full">
                    <h2 className="text-xl font-semibold text-gray-900">Question List Preview</h2>
                    <p className="mt-1 text-sm text-gray-600">Total Questions: {questions.length}</p>

                    <div className="mt-4 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {questions.length > 0 ? (
                        questions.map((q, i) => (
                          <div key={i} className="rounded-md border border-gray-200 p-4">
                            <p className="text-sm font-medium text-gray-900">{i + 1}. {q.text || <em>No text yet</em>}</p>
                            <p className="mt-1 text-sm">
                              <span className="font-semibold">Answer:</span>{" "}
                              {q.correctAnswer === null ? <span className="text-gray-500">Not selected</span> : q.correctAnswer ? <span className="text-green-600">True</span> : <span className="text-red-600">False</span>}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 italic py-8">No questions added yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={() => {
                    setTitle("");
                    setDescription("");
                    setPassMark("");
                    setQuestions([]);
                    setNewQuestionText("");
                    setNewQuestionAnswer(null);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleCreateAndAdd}
                  className="flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary/90"
                >
                  <span>Create Induction &amp; Publish</span>
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

/* ---------- Helpers ---------- */

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
