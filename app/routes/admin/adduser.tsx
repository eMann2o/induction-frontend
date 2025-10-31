import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import Swal from "sweetalert2";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Footer from "~/components/footer";
import { Link } from "react-router";

/* -------------------------------------------------------------------------- */
/* 🧩 Types                                                                  */
/* -------------------------------------------------------------------------- */
interface UserFormData {
  name: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  role: string;
  password?: string;
}

export default function AddUser() {
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    role: "trainee",
    email: "",
    phoneNumber: "",
    department: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  /* --------------------------- Handle Input Change -------------------------- */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* --------------------------- Handle Form Submit --------------------------- */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      const res = await axios.post(
        "http://localhost:3000/user-add",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "User Created!",
          text: res.data.message,
          confirmButtonColor: "#2563eb",
        });

        setFormData({
          name: "",
          role: "trainee",
          email: "",
          phoneNumber: "",
          department: "",
          password: "",
        });
      }
    } catch (err) {
      const message =
        (err as AxiosError<{ message?: string }>)?.response?.data?.message ||
        (err as Error).message ||
        "Failed to create user";

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

  /* -------------------------------------------------------------------------- */
  /* 🧩 Render                                                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div>
      <AdminNavbar />
      <Title title="Add New User" />
      <div className="bg-background-light text-gray-800 font-display">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 min-h-screen">
          <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-md border border-gray-200">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">
              Create New User
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-primary focus:border-primary"
                >
                  <option value="trainee">Trainee</option>
                  <option value="facilitator">Facilitator</option>
                  <option value="hse">HSE</option>
                  <option value="hr">HR</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              {/* Conditional fields depending on role */}
              {formData.role === "trainee" ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
                
                <Link to={"/add-trainee"}>
                  <button className="flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                    <span className="material-symbols-outlined text-base">
                      add
                    </span>
                    <span>New Trainee</span>
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
