
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Search,
  Plus,
  ArrowLeft,
  X,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
} from "lucide-react";

type Doctor = {
  id: string;
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  experience: string;
  availability: string;
};

const emptyForm = {
  name: "",
  specialization: "",
  department: "",
  phone: "",
  email: "",
  experience: "",
  availability: "Available",
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [form, setForm] = useState(emptyForm);

  // Fetch doctors from PostgreSQL
  async function fetchDoctors() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/doctors");

      if (!response.ok) {
        throw new Error("Failed to fetch doctors.");
      }

      const result = await response.json();

      setDoctors(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Fetch doctors error:", error);
      setError("Unable to load doctors. Check your database connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization} ${doctor.department} ${doctor.phone} ${doctor.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const availableCount = doctors.filter(
    (doctor) => doctor.availability === "Available"
  ).length;

  const unavailableCount = doctors.filter(
    (doctor) => doctor.availability === "Unavailable"
  ).length;

  function resetForm() {
    setForm(emptyForm);
    setEditingDoctor(null);
    setShowForm(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (saving) return;

    const cleanedForm = {
      name: form.name.trim(),
      specialization: form.specialization.trim(),
      department: form.department.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      experience: form.experience.trim(),
      availability: form.availability,
    };

    try {
      setSaving(true);
      setError("");

      const url = editingDoctor
        ? `/api/doctors/${editingDoctor.id}`
        : "/api/doctors";

      const method = editingDoctor ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedForm),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save doctor.");
      }

      resetForm();

      await fetchDoctors();

      window.dispatchEvent(new Event("hospital-data-updated"));
    } catch (error) {
      console.error("Save doctor error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to save doctor."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(doctor: Doctor) {
    setEditingDoctor(doctor);

    setForm({
      name: doctor.name ?? "",
      specialization: doctor.specialization ?? "",
      department: doctor.department ?? "",
      phone: doctor.phone ?? "",
      email: doctor.email ?? "",
      experience: doctor.experience?.toString() ?? "",
      availability: doctor.availability ?? "Available",
    });

    setError("");
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    const doctor = doctors.find((d) => d.id === id);

    if (
      !window.confirm(`Delete Dr. ${doctor?.name ?? "this doctor"}?`)
    ) {
      return;
    }

    try {
      setError("");

      const response = await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete doctor.");
      }

      await fetchDoctors();

      window.dispatchEvent(new Event("hospital-data-updated"));
    } catch (error) {
      console.error("Delete doctor error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete doctor."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="mb-1 text-sm font-semibold text-emerald-700">
                STAFF MANAGEMENT
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Doctors
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage doctor information and availability.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingDoctor(null);
                setForm(emptyForm);
                setError("");
                setShowForm(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              Add Doctor
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && !showForm && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Stethoscope size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Doctors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.length}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-50 p-3 text-green-600">
                <User size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold text-gray-900">
                  {availableCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <User size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">Unavailable</p>
                <p className="text-2xl font-bold text-gray-900">
                  {unavailableCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Doctor List */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Doctor List</h2>

              <p className="mt-1 text-sm text-gray-500">
                View and manage registered doctors.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="search"
                placeholder="Search doctors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Doctor</th>
                  <th className="px-5 py-4 font-semibold">Specialization</th>
                  <th className="px-5 py-4 font-semibold">Department</th>
                  <th className="px-5 py-4 font-semibold">Experience</th>
                  <th className="px-5 py-4 font-semibold">Availability</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <p className="text-sm text-gray-500">
                        Loading doctors...
                      </p>
                    </td>
                  </tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <Stethoscope
                        size={40}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="font-medium text-gray-700">
                        {search
                          ? "No doctors found"
                          : "No doctors registered"}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {search
                          ? "Try another search term."
                          : "Add a doctor to get started."}
                      </p>

                      {!search && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={16} />
                          Add Doctor
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doctor) => (
                    <tr
                      key={doctor.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <User size={18} />
                          </div>

                          <div>
                            <p className="font-medium text-gray-900">
                              {doctor.name}
                            </p>

                            <p className="text-xs text-gray-500">
                              {doctor.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {doctor.specialization}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {doctor.department}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {doctor.experience
                          ? `${doctor.experience} years`
                          : "Not specified"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            doctor.availability === "Available"
                              ? "bg-green-50 text-green-700"
                              : "bg-orange-50 text-orange-700"
                          }`}
                        >
                          {doctor.availability}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(doctor)}
                            aria-label={`Edit ${doctor.name}`}
                            title="Edit doctor"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(doctor.id)}
                            aria-label={`Delete ${doctor.name}`}
                            title="Delete doctor"
                            className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Showing {filteredDoctors.length} of {doctors.length} doctors
          </div>
        </section>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) resetForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="doctor-form-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Staff record
                </p>

                <h2
                  id="doctor-form-title"
                  className="mt-1 text-xl font-semibold text-gray-900"
                >
                  {editingDoctor ? "Edit Doctor" : "Add Doctor"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter doctor details below.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Doctor Name <span className="text-rose-600">*</span>
                  </span>

                  <input
                    autoFocus
                    required
                    maxLength={100}
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Full name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {/* Specialization */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Specialization <span className="text-rose-600">*</span>
                  </span>

                  <input
                    required
                    maxLength={100}
                    type="text"
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="Specialization"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {/* Department */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department <span className="text-rose-600">*</span>
                  </span>

                  <input
                    required
                    maxLength={100}
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="Department"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {/* Experience */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Experience (Years)
                  </span>

                  <input
                    type="number"
                    min="0"
                    max="70"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    placeholder="Years of experience"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {/* Phone */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone Number <span className="text-rose-600">*</span>
                  </span>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      required
                      maxLength={30}
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="Phone number"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                {/* Email */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </span>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="email"
                      maxLength={254}
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="Email address"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                {/* Availability */}
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Availability
                  </span>

                  <select
                    value={form.availability}
                    onChange={(e) =>
                      setForm({ ...form, availability: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingDoctor
                      ? "Update Doctor"
                      : "Save Doctor"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
