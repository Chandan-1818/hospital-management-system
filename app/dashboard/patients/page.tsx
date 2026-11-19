
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  bloodGroup: string;
  address: string;
};

type PatientForm = Omit<Patient, "id">;

const emptyForm: PatientForm = {
  name: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  email: "",
  bloodGroup: "",
  address: "",
};

function getAge(dateOfBirth: string) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(`${dateOfBirth}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  const beforeBirthday =
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate());

  if (beforeBirthday) age -= 1;

  return age >= 0 ? age : null;
}

function normalizePatient(patient: any): Patient {
  return {
    id: String(patient.id ?? ""),
    name: patient.name ?? "",
    dateOfBirth: patient.dateOfBirth
      ? String(patient.dateOfBirth).slice(0, 10)
      : "",
    gender: patient.gender ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    bloodGroup: patient.bloodGroup ?? "",
    address: patient.address ?? "",
  };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] =
    useState<Patient | null>(null);
  const [form, setForm] = useState<PatientForm>(emptyForm);

  // Fetch patients from PostgreSQL
  async function fetchPatients() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/patients", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load patients from database.");
      }

      const data = await response.json();

      setPatients(
        Array.isArray(data) ? data.map(normalizePatient) : []
      );
    } catch (error) {
      console.error("Fetch patients error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load patients."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return patients;

    return patients.filter((patient) =>
      [
        patient.id,
        patient.name,
        patient.phone,
        patient.email,
        patient.bloodGroup,
        patient.gender,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [patients, search]);

  function closeForm() {
    setForm(emptyForm);
    setEditingPatient(null);
    setShowForm(false);
    setError("");
  }

  // Register or update patient in PostgreSQL
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cleanedForm = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
    };

    if (!cleanedForm.name || !cleanedForm.phone) {
      setError("Name and phone number are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingPatient);

      const patientId = editingPatient
        ? editingPatient.id
        : `PT-${Date.now().toString().slice(-6)}`;

      const response = await fetch(
        isEditing
          ? `/api/patients/${encodeURIComponent(patientId)}`
          : "/api/patients",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: patientId,
            ...cleanedForm,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Failed to ${isEditing ? "update" : "register"} patient.`
        );
      }

      const savedPatient = normalizePatient(result);

      if (isEditing) {
        setPatients((current) =>
          current.map((patient) =>
            patient.id === editingPatient!.id
              ? savedPatient
              : patient
          )
        );
      } else {
        setPatients((current) => [
          savedPatient,
          ...current,
        ]);
      }

      window.dispatchEvent(
        new Event("hospital-data-updated")
      );

      closeForm();
    } catch (error) {
      console.error("Save patient error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save patient."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(patient: Patient) {
    setEditingPatient(patient);

    setForm({
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      bloodGroup: patient.bloodGroup,
      address: patient.address,
    });

    setError("");
    setShowForm(true);
  }

  // Delete patient from PostgreSQL
  async function handleDelete(patient: Patient) {
    if (
      !window.confirm(
        `Delete ${patient.name}'s patient record?`
      )
    ) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `/api/patients/${encodeURIComponent(patient.id)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete patient."
        );
      }

      setPatients((current) =>
        current.filter((entry) => entry.id !== patient.id)
      );

      window.dispatchEvent(
        new Event("hospital-data-updated")
      );
    } catch (error) {
      console.error("Delete patient error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete patient."
      );
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-800 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-700"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold text-emerald-700">
              PATIENT MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Patients
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Register and manage patient information in one place.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingPatient(null);
              setForm(emptyForm);
              setError("");
              setShowForm(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Register patient
          </button>
        </div>

        {/* Error Message */}
        {error && !showForm && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>

            <button
              onClick={() => setError("")}
              className="ml-3 rounded p-1 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Patient Statistics */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Users size={23} />
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Registered patients
              </p>

              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : patients.length}
              </p>
            </div>
          </div>
        </section>

        {/* Patient List */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">
                Patient list
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Search by name, patient ID, contact, or blood group.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                aria-label="Search patients"
                type="search"
                placeholder="Search patients..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Patient
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Patient ID
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Age / Gender
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Blood group
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Phone
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-sm text-gray-500"
                    >
                      Loading patients from database...
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <UserRound
                        size={40}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="font-medium text-gray-700">
                        {search
                          ? "No matching patients"
                          : "No patients registered yet"}
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        {search
                          ? "Try another name, patient ID, or contact detail."
                          : "Register a patient to start building your patient list."}
                      </p>

                      {!search && (
                        <button
                          onClick={() => {
                            setForm(emptyForm);
                            setEditingPatient(null);
                            setError("");
                            setShowForm(true);
                          }}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={16} />
                          Register patient
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const age = getAge(patient.dateOfBirth);

                    return (
                      <tr
                        key={patient.id}
                        className="border-t border-gray-100 transition hover:bg-gray-50"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                              <UserRound size={18} />
                            </div>

                            <div>
                              <p className="font-medium text-gray-900">
                                {patient.name}
                              </p>

                              <p className="text-xs text-gray-500">
                                {patient.email || "No email provided"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-700">
                          {patient.id}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {age === null ? "—" : `${age} years`} /{" "}
                          {patient.gender || "—"}
                        </td>

                        <td className="px-5 py-4">
                          {patient.bloodGroup ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                              <Droplets size={13} />
                              {patient.bloodGroup}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">
                              —
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {patient.phone || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEdit(patient)}
                              aria-label={`Edit ${patient.name}`}
                              title="Edit patient"
                              className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() => handleDelete(patient)}
                              aria-label={`Delete ${patient.name}`}
                              title="Delete patient"
                              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Showing {loading ? 0 : filteredPatients.length} of{" "}
            {loading ? 0 : patients.length} patients
          </div>
        </section>
      </div>

      {/* Patient Registration / Edit Modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="patient-form-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Patient record
                </p>

                <h2
                  id="patient-form-title"
                  className="mt-1 text-xl font-semibold text-gray-900"
                >
                  {editingPatient
                    ? "Edit patient information"
                    : "Register patient"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the patient details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full name <span className="text-rose-600">*</span>
                  </span>

                  <input
                    autoFocus
                    required
                    maxLength={100}
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Patient's full name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                {/* Date of Birth */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Date of birth <span className="text-rose-600">*</span>
                  </span>

                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      required
                      type="date"
                      max={new Date().toISOString().slice(0, 10)}
                      value={form.dateOfBirth}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          dateOfBirth: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                {/* Gender */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Gender <span className="text-rose-600">*</span>
                  </span>

                  <select
                    required
                    value={form.gender}
                    onChange={(event) =>
                      setForm({ ...form, gender: event.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Select gender
                    </option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
                </label>

                {/* Phone */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone number <span className="text-rose-600">*</span>
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
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      placeholder="Phone number"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                {/* Email */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email address
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
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      placeholder="name@example.com"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                {/* Blood Group */}
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Blood group
                  </span>

                  <select
                    value={form.bloodGroup}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        bloodGroup: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="">Select blood group</option>

                    {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                      (group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      )
                    )}
                  </select>
                </label>

                {/* Address */}
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Address
                  </span>

                  <textarea
                    rows={2}
                    maxLength={300}
                    value={form.address}
                    onChange={(event) =>
                      setForm({ ...form, address: event.target.value })
                    }
                    placeholder="Street, city, and postal code"
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
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
                    : editingPatient
                      ? "Save changes"
                      : "Register patient"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
