"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CalendarX,
  Check,
  Clock3,
  Plus,
  Search,
  Stethoscope,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Patient = {
  id: string;
  name: string;
};

type Doctor = {
  id: number;
  name: string;
  specialization: string;
  department: string;
  availability: string;
};

type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";

type Appointment = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: number;
  doctorName: string;
  specialization: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
};

type AppointmentForm = {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: AppointmentStatus;
};

const appointmentStorageKey = "medicare-appointments";
const appointmentStatuses: AppointmentStatus[] = [
  "Pending",
  "Confirmed",
  "Completed",
  "Cancelled",
];

const emptyForm: AppointmentForm = {
  patientId: "",
  doctorId: "",
  date: "",
  time: "",
  reason: "",
  status: "Pending",
};

function readStoredArray<T>(key: string): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function formatAppointmentDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusClass(status: AppointmentStatus) {
  switch (status) {
    case "Confirmed":
      return "bg-blue-50 text-blue-700";
    case "Completed":
      return "bg-emerald-50 text-emerald-700";
    case "Cancelled":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

export default function AppointmentsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<AppointmentForm>(emptyForm);

  useEffect(() => {
    setPatients(readStoredArray<Patient>("medicare-patients"));
    setDoctors(readStoredArray<Doctor>("medicare-doctors"));
    setAppointments(readStoredArray<Appointment>(appointmentStorageKey));
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(
      appointmentStorageKey,
      JSON.stringify(appointments)
    );
  }, [appointments, storageLoaded]);

  const filteredAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return appointments;
    return appointments.filter((appointment) =>
      [
        appointment.id,
        appointment.patientName,
        appointment.patientId,
        appointment.doctorName,
        appointment.specialization,
        appointment.status,
        appointment.reason,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [appointments, search]);

  const statusCounts = appointmentStatuses.reduce(
    (counts, status) => ({
      ...counts,
      [status]: appointments.filter((item) => item.status === status).length,
    }),
    {} as Record<AppointmentStatus, number>
  );

  const availableDoctors = doctors.filter(
    (doctor) => doctor.availability === "Available"
  );

  function closeForm() {
    setForm(emptyForm);
    setShowForm(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const patient = patients.find((item) => item.id === form.patientId);
    const doctor = availableDoctors.find(
      (item) => String(item.id) === form.doctorId
    );
    if (!patient || !doctor) return;

    const appointment: Appointment = {
      id: `AP-${Date.now().toString().slice(-6)}`,
      patientId: patient.id,
      patientName: patient.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      date: form.date,
      time: form.time,
      reason: form.reason.trim(),
      status: form.status,
    };

    setAppointments((current) => [appointment, ...current]);
    closeForm();
  }

  function updateStatus(id: string, status: AppointmentStatus) {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment
      )
    );
  }

  function deleteAppointment(appointment: Appointment) {
    if (window.confirm(`Delete the appointment for ${appointment.patientName}?`)) {
      setAppointments((current) =>
        current.filter((item) => item.id !== appointment.id)
      );
    }
  }

  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
              APPOINTMENT MANAGEMENT
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Appointments
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Schedule visits and keep appointment statuses up to date.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Book appointment
          </button>
        </div>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {appointmentStatuses.map((status) => {
            const Icon =
              status === "Pending"
                ? Clock3
                : status === "Confirmed"
                  ? CalendarClock
                  : status === "Completed"
                    ? Check
                    : CalendarX;
            return (
              <div
                key={status}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-gray-500">{status}</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {statusCounts[status]}
                    </p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${statusClass(status)}`}
                  >
                    <Icon size={19} />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {storageLoaded && (patients.length === 0 || availableDoctors.length === 0) && (
          <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Complete your setup to book</p>
              <p className="mt-1 text-amber-800">
                {patients.length === 0 && availableDoctors.length === 0
                  ? "Register a patient and add an available doctor first."
                  : patients.length === 0
                    ? "Register a patient before booking an appointment."
                    : "Add an available doctor before booking an appointment."}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {patients.length === 0 && (
                <Link
                  href="/dashboard/patients"
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-medium transition hover:bg-amber-100"
                >
                  Add patient
                </Link>
              )}
              {availableDoctors.length === 0 && (
                <Link
                  href="/dashboard/doctors"
                  className="rounded-lg border border-amber-300 bg-white px-3 py-2 font-medium transition hover:bg-amber-100"
                >
                  Add doctor
                </Link>
              )}
            </div>
          </section>
        )}

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Appointment list</h2>
              <p className="mt-1 text-sm text-gray-500">
                Review scheduled visits and update their status.
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                aria-label="Search appointments"
                type="search"
                placeholder="Search appointments..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Patient</th>
                  <th className="px-5 py-4 font-semibold">Doctor</th>
                  <th className="px-5 py-4 font-semibold">Date &amp; time</th>
                  <th className="px-5 py-4 font-semibold">Reason</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <CalendarDays
                        size={40}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p className="font-medium text-gray-700">
                        {search
                          ? "No matching appointments"
                          : "No appointments booked yet"}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {search
                          ? "Try searching by patient, doctor, or status."
                          : "Book an appointment to add a visit to the schedule."}
                      </p>
                      {!search && patients.length > 0 && availableDoctors.length > 0 && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={16} />
                          Book appointment
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr
                      key={appointment.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                            <UserRound size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {appointment.patientName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.patientId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <Stethoscope size={17} className="text-blue-600" />
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {appointment.doctorName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {appointment.specialization}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {formatAppointmentDate(appointment.date)}
                        </p>
                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock3 size={13} />
                          {new Date(
                            `1970-01-01T${appointment.time}`
                          ).toLocaleTimeString(undefined, {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </td>
                      <td className="max-w-[180px] truncate px-5 py-4 text-sm text-gray-600">
                        {appointment.reason || "General consultation"}
                      </td>
                      <td className="px-5 py-4">
                        <label className="sr-only" htmlFor={`status-${appointment.id}`}>
                          Status for {appointment.patientName}
                        </label>
                        <select
                          id={`status-${appointment.id}`}
                          value={appointment.status}
                          onChange={(event) =>
                            updateStatus(
                              appointment.id,
                              event.target.value as AppointmentStatus
                            )
                          }
                          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none ring-1 ring-inset ring-black/5 ${statusClass(appointment.status)}`}
                        >
                          {appointmentStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => deleteAppointment(appointment)}
                          aria-label={`Delete appointment for ${appointment.patientName}`}
                          title="Delete appointment"
                          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </div>
        </section>
      </div>

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
            aria-labelledby="appointment-form-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  New visit
                </p>
                <h2
                  id="appointment-form-title"
                  className="mt-1 text-xl font-semibold text-gray-900"
                >
                  Book an appointment
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Choose a patient, an available doctor, and a visit time.
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Patient <span className="text-rose-600">*</span>
                  </span>
                  <select
                    required
                    value={form.patientId}
                    onChange={(event) =>
                      setForm({ ...form, patientId: event.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Select a patient
                    </option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} · {patient.id}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Available doctor <span className="text-rose-600">*</span>
                  </span>
                  <select
                    required
                    value={form.doctorId}
                    onChange={(event) =>
                      setForm({ ...form, doctorId: event.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Select a doctor
                    </option>
                    {availableDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} · {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Appointment date <span className="text-rose-600">*</span>
                  </span>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="date"
                      min={localToday}
                      value={form.date}
                      onChange={(event) =>
                        setForm({ ...form, date: event.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Appointment time <span className="text-rose-600">*</span>
                  </span>
                  <div className="relative">
                    <Clock3
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="time"
                      value={form.time}
                      onChange={(event) =>
                        setForm({ ...form, time: event.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Status
                  </span>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as AppointmentStatus,
                      })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {appointmentStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Reason for visit
                  </span>
                  <input
                    maxLength={120}
                    type="text"
                    value={form.reason}
                    onChange={(event) =>
                      setForm({ ...form, reason: event.target.value })
                    }
                    placeholder="e.g. General consultation"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patients.length === 0 || availableDoctors.length === 0}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Book appointment
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
