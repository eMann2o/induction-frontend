// TraineeScan.tsx
import React, { useEffect, useState } from "react";
import type { JSX } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router";
import Title from "../components/Title";
import axios from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Footer from "~/components/footer";

type ValidateResponse = {
  success: boolean;
  message?: string;
  session?: { id: string; training?: any; facilitator?: any };
  trainee?: { id: string; name?: string; phoneNumber?: string; email?: string };
};

export default function TraineeScan() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<any>(null); // display training title etc.

  useEffect(() => {
    // Optionally fetch session basic info for display (no auth required)
    // You could use GET /sessions/:id to fetch training & facilitator info if you have such route.
  }, [id]);

  const handleJoin = async () => {
    if (!phoneNumber.trim()) {
      Swal.fire("Enter phone", "Please enter your phone number to join.", "warning");
      return;
    }
    try {
      setLoading(true);
      Swal.fire({ title: "Validating...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const res = await axios.post<ValidateResponse>(`${import.meta.env.VITE_API_BASE_URL}/sessions/${id}/validate`, { phoneNumber: phoneNumber.trim() });

      Swal.close();

      if (res.data?.success) {
        // Optionally store trainee/session in localStorage for quiz pages or pass via router state
        // Now fetch questions
        const qRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sessions/${id}/questions`);
        if (qRes.data?.success) {
          // navigate to a quiz page and pass questions (or store in state)
          navigate(`/sessions/${id}/quiz`, { state: { questions: qRes.data.questions, session: res.data.session, trainee: res.data.trainee } });
        } else {
          Swal.fire("No questions", qRes.data?.message || "No questions found for this session", "info");
        }
      } else {
        Swal.fire("Denied", res.data?.message || "Validation failed", "error");
      }
    } catch (err: any) {
      Swal.close();
      Swal.fire("Error", err?.response?.data?.message || err.message || "Failed to validate", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title title="Home" />
      <main className="min-h-screen bg-background-light font-display text-gray-800">
        <div className="max-w-xl mx-auto py-20 px-4">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h1 className="text-xl font-semibold">Join Session</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your phone number to confirm you're enrolled for this session.</p>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Phone number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g., +233501234567"
                className="mt-2 block w-full rounded-md border-gray-300 p-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => navigate(-1)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleJoin} disabled={loading} className="rounded-md bg-primary px-4 py-2 text-white">
                Join Session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
