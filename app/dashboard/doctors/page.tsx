
"use client";

import { useState } from "react";
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
  id: number;
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  experience: string;
  availability: string;
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    department: "",
    phone: "",
    email: "",
    experience: "",
    availability: "Available",
  });

  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization} ${doctor.department} ${doctor.phone}`
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
    setForm({
      name: "",
      specialization: "",
      department: "",
      phone: "",
      email: "",
      experience: "",
      availability: "Available",
    });

    setEditingDoctor(null);
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (editingDoctor) {
      setDoctors((previous) =>
        previous.map((doctor) =>
          doctor.id === editingDoctor.id
            ? { ...doctor, ...form }
            : doctor
        )
      );
    } else {
      const newDoctor: Doctor = {
        id: Date.now(),
        ...form,
      };

      setDoctors((previous) => [newDoctor, ...previous]);
    }

    resetForm();
  }

  function handleEdit(doctor: Doctor) {
    setEditingDoctor(doctor);

    setForm({
      name: doctor.name,
      specialization: doctor.specialization,
      department: doctor.department,
      phone: doctor.phone,
      email: doctor.email,
      experience: doctor.experience,
      availability: doctor.availability,
    });

    setShowForm(true);
  }

  function handleDelete(id: number) {
    if (window.confirm("Delete this doctor?")) {
      setDoctors((previous) =>
        previous.filter((doctor) => doctor.id !== id)
      );
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Doctors
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage doctor information and availability.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
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

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
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
      </div>

      {/* Doctor List */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Doctor List
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage registered doctors.
            </p>
          </div>

          <div className="relative sm:w-72">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search doctors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Specialization</th>
                <th className="px-5 py-4">Department</th>
                <th className="px-5 py-4">Experience</th>
                <th className="px-5 py-4">Availability</th>
                <th className="px-5 py-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <Stethoscope
                      size={40}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="font-medium text-gray-700">
                      {search ? "No doctors found" : "No doctors registered"}
                    </p>

                    <p className="mt-1 text-sm text-gray-400">
                      {search
                        ? "Try another search term."
                        : "Add a doctor to get started."}
                    </p>

                    {!search && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700"
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
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
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
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          doctor.availability === "Available"
                            ? "bg-green-50 text-green-700"
                            : "bg-orange-50 text-orange-700"
                        }`}
                      >
                        {doctor.availability}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(doctor)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(doctor.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete"
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
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {editingDoctor ? "Edit Doctor" : "Add Doctor"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter doctor details below.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Doctor Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Full name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Specialization */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Specialization *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({ ...form, specialization: e.target.value })
                    }
                    placeholder="Specialization"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.department}
                    onChange={(e) =>
                      setForm({ ...form, department: e.target.value })
                    }
                    placeholder="Department"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                    placeholder="Years of experience"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="Phone number"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="Email address"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-black placeholder:text-gray-400 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Availability */}
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Availability
                  </label>
                  <select
                    value={form.availability}
                    onChange={(e) =>
                      setForm({ ...form, availability: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-black outline-none focus:border-emerald-500"
                  >
                    <option value="Available">Available</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  {editingDoctor ? "Update Doctor" : "Save Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
