import React, { useState } from "react";
import Footer from "~/components/footer";
import AdminNavbar from "~/components/navbar";
import Title from "~/components/Title";
import Swal from "sweetalert2";

const API_URL = "http://localhost:3000";

interface UserFormData {
  name: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  role: string;
  password?: string;
}

/* ------------------------------ Components ------------------------------ */

function RoleCard({
  role,
  label,
  icon,
  isSelected,
  onChange,
}: {
  role: string;
  label: string;
  icon: string;
  isSelected: boolean;
  onChange: () => void;
}) {
  return (
    <label
      className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
      onClick={onChange}
    >
      <span
        className={`material-symbols-rounded text-3xl transition-colors ${
          isSelected ? "text-blue-600" : "text-gray-400"
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-sm font-medium ${
          isSelected ? "text-blue-700" : "text-gray-700"
        }`}
      >
        {label}
      </span>
      <input
        type="radio"
        name="role"
        value={role}
        checked={isSelected}
        onChange={() => {}}
        className="mt-1"
      />
    </label>
  );
}

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder,
  icon,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  icon?: string;
  error?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <span className="material-symbols-rounded absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-lg border text-gray-900 placeholder-gray-500 focus:ring-2 focus:border-transparent transition-all py-2.5 ${
            icon ? "pl-11 pr-4" : "px-4"
          } ${
            error
              ? "border-red-300 bg-red-50 focus:ring-red-500"
              : "border-gray-300 bg-white focus:ring-blue-500"
          }`}
        />
      </div>
      {error && <p className="text-red-600 text-sm mt-1.5 flex items-center gap-1">
        <span className="material-symbols-rounded text-xs">error</span>
        {error}
      </p>}
    </div>
  );
}

/* ------------------------------ Main Component ------------------------------ */

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (formData.role === "trainee") {
      if (!formData.phoneNumber?.trim()) {
        newErrors.phoneNumber = "Phone number is required for trainees";
      }
      if (!formData.department?.trim()) {
        newErrors.department = "Department is required for trainees";
      }
    } else {
      if (!formData.email?.trim()) {
        newErrors.email = "Email is required for staff accounts";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email";
      }
      if (!formData.password?.trim()) {
        newErrors.password = "Password is required for staff accounts";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      const payload: UserFormData = {
        name: formData.name,
        role: formData.role,
      };

      if (formData.role === "trainee") {
        payload.phoneNumber = formData.phoneNumber;
        payload.department = formData.department;
      } else {
        payload.email = formData.email;
        payload.password = formData.password;
      }

      const res = await fetch(`${API_URL}/user-add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message || "User created successfully!");

        await Swal.fire({
          title: "✓ User Created",
          html: `
            <div style="text-align: left;">
              <p style="margin: 0 0 12px 0; color: #555;">${data.message || "User has been created successfully."}</p>
              <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin: 12px 0;">
                <p style="margin: 0; font-size: 0.9rem; color: #1e40af;"><strong>Name:</strong> ${formData.name}</p>
                <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #1e40af;"><strong>Role:</strong> ${formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</p>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 0.85rem; color: #666;">Credentials have been sent${formData.role === "trainee" ? " (via system)" : " via email"}.</p>
            </div>
          `,
          icon: "success",
          confirmButtonColor: "#2563eb",
          confirmButtonText: "Got it!",
        });

        setFormData({
          name: "",
          role: "trainee",
          email: "",
          phoneNumber: "",
          department: "",
          password: "",
        });
        setSuccessMessage(null);
      } else {
        await Swal.fire({
          title: "Error",
          text: data.message || "Failed to create user",
          icon: "error",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      const message = (err as Error).message || "Failed to create user";
      await Swal.fire({
        title: "Error",
        text: message,
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  const isTrainee = formData.role === "trainee";

  return (
    <div>
      <AdminNavbar />
      <Title title="Add User" />
      <div className="bg-gray-50 text-gray-800 min-h-screen">
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-20 pt-24">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900">Create New User</h1>
              <p className="text-gray-600 mt-2">
                Register a new user and assign them to the system with appropriate permissions
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Name Field */}
                <FormInput
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter full name"
                  icon="person"
                  error={errors.name}
                />

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    User Role <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    <RoleCard
                      role="trainee"
                      label="Trainee"
                      icon="school"
                      isSelected={formData.role === "trainee"}
                      onChange={() =>
                        setFormData({ ...formData, role: "trainee" })
                      }
                    />
                    <RoleCard
                      role="facilitator"
                      label="Facilitator"
                      icon="person_check"
                      isSelected={formData.role === "facilitator"}
                      onChange={() =>
                        setFormData({ ...formData, role: "facilitator" })
                      }
                    />
                    <RoleCard
                      role="hr"
                      label="HR"
                      icon="group"
                      isSelected={formData.role === "hr"}
                      onChange={() => setFormData({ ...formData, role: "hr" })}
                    />
                    <RoleCard
                      role="hse"
                      label="HSE"
                      icon="safety_check"
                      isSelected={formData.role === "hse"}
                      onChange={() => setFormData({ ...formData, role: "hse" })}
                    />
                    <RoleCard
                      role="superadmin"
                      label="Admin"
                      icon="admin_panel_settings"
                      isSelected={formData.role === "superadmin"}
                      onChange={() =>
                        setFormData({ ...formData, role: "superadmin" })
                      }
                    />
                  </div>
                </div>

                {/* Conditional Fields */}
                {isTrainee ? (
                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    <div className="bg-blue-50 rounded-lg p-4 flex gap-3 border border-blue-100">
                      <span className="material-symbols-rounded text-blue-600 flex-shrink-0 mt-0.5">
                        info
                      </span>
                      <div>
                        <p className="text-sm text-blue-900 font-semibold">
                          Trainee Information
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Credentials will be generated and the trainee can use their phone number for QR code login
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormInput
                        label="Phone Number"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        placeholder="+1 (555) 000-0000"
                        icon="phone"
                        error={errors.phoneNumber}
                      />
                      <FormInput
                        label="Department"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Engineering"
                        icon="business"
                        error={errors.department}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 pt-4 border-t border-gray-200">
                    <div className="bg-amber-50 rounded-lg p-4 flex gap-3 border border-amber-100">
                      <span className="material-symbols-rounded text-amber-600 flex-shrink-0 mt-0.5">
                        info
                      </span>
                      <div>
                        <p className="text-sm text-amber-900 font-semibold">
                          Staff Account
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Login credentials will be sent via email. User can change password after first login
                        </p>
                      </div>
                    </div>

                    <FormInput
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="name@example.com"
                      icon="email"
                      error={errors.email}
                    />

                    <FormInput
                      label="Temporary Password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      icon="lock"
                      error={errors.password}
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-rounded">arrow_back</span>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed active:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-rounded">add</span>
                        <span>Create User</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Info Cards */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <span className="material-symbols-rounded text-blue-600 flex-shrink-0 text-2xl">
                    mail
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Email Notifications</h3>
                    <p className="text-xs text-gray-600 mt-2">
                      Staff users receive credentials via email. Trainees get system-generated credentials.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <span className="material-symbols-rounded text-green-600 flex-shrink-0 text-2xl">
                    check_circle
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Role-Based Access</h3>
                    <p className="text-xs text-gray-600 mt-2">
                      Features and permissions are automatically restricted by assigned role
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <span className="material-symbols-rounded text-purple-600 flex-shrink-0 text-2xl">
                    qr_code
                  </span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">QR Login</h3>
                    <p className="text-xs text-gray-600 mt-2">
                      Trainees can use their phone number for secure QR code login
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}