"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Pencil,
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
};

type MedicalRecord = {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: number;
  doctorName: string;
  date: string;
  diagnosis: string;
  prescription: string;
  doctorNotes: string;
  patientHistory: string;
};

type RecordForm = Omit<
  MedicalRecord,
  "id" | "patientName" | "doctorName"
>;

const recordsStorageKey = "medicare-medical-records";

const emptyForm: RecordForm = {
  patientId: "",
  doctorId: 0,
  date: "",
  diagnosis: "",
  prescription: "",
  doctorNotes: "",
  patientHistory: "",
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

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
}

function formatRecordDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function RecordSection({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-gray-700">
        {content || "Not recorded"}
      </p>
    </section>
  );
}

export default function MedicalRecordsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [form, setForm] = useState<RecordForm>(emptyForm);

  useEffect(() => {
    setPatients(readStoredArray<Patient>("medicare-patients"));
    setDoctors(readStoredArray<Doctor>("medicare-doctors"));
    setRecords(readStoredArray<MedicalRecord>(recordsStorageKey));
    setStorageLoaded(true);
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(recordsStorageKey, JSON.stringify(records));
  }, [records, storageLoaded]);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;

    return records.filter((record) =>
      [
        record.id,
        record.patientName,
        record.patientId,
        record.doctorName,
        record.diagnosis,
        record.prescription,
        record.doctorNotes,
        record.patientHistory,
        record.date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [records, search]);

  function openNewRecord() {
    setEditingRecord(null);
    setForm({ ...emptyForm, date: getLocalDate() });
    setShowForm(true);
  }

  function closeForm() {
    setForm(emptyForm);
    setEditingRecord(null);
    setShowForm(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const patient = patients.find((entry) => entry.id === form.patientId);
    const doctor = doctors.find((entry) => entry.id === Number(form.doctorId));
    if (!patient || !doctor) return;

    if (editingRecord) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editingRecord.id
            ? {
                ...record,
                ...form,
                doctorId: doctor.id,
                patientName: patient.name,
                doctorName: doctor.name,
              }
            : record
        )
      );
    } else {
      const newRecord: MedicalRecord = {
        ...form,
        id: `MR-${Date.now().toString().slice(-6)}`,
        doctorId: doctor.id,
        patientName: patient.name,
        doctorName: doctor.name,
      };
      setRecords((current) => [newRecord, ...current]);
    }

    closeForm();
  }

  function handleEdit(record: MedicalRecord) {
    setEditingRecord(record);
    setForm({
      patientId: record.patientId,
      doctorId: record.doctorId,
      date: record.date,
      diagnosis: record.diagnosis,
      prescription: record.prescription,
      doctorNotes: record.doctorNotes,
      patientHistory: record.patientHistory,
    });
    setShowForm(true);
  }

  function handleDelete(record: MedicalRecord) {
    if (window.confirm(`Delete the medical record for ${record.patientName}?`)) {
      setRecords((current) => current.filter((entry) => entry.id !== record.id));
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
              PATIENT CARE
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Medical records
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Keep diagnoses, prescriptions, doctor notes, and patient history together.
            </p>
          </div>
          <button
            onClick={openNewRecord}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add medical record
          </button>
        </div>

        {storageLoaded && (patients.length === 0 || doctors.length === 0) && (
          <section className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Complete your setup to add a record</p>
              <p className="mt-1 text-amber-800">
                {patients.length === 0 && doctors.length === 0
                  ? "Register a patient and add a doctor first."
                  : patients.length === 0
                    ? "Register a patient before adding a medical record."
                    : "Add a doctor before adding a medical record."}
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
              {doctors.length === 0 && (
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
              <h2 className="font-semibold text-gray-900">Patient records</h2>
              <p className="mt-1 text-sm text-gray-500">
                {records.length} {records.length === 1 ? "record" : "records"} on file
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                aria-label="Search medical records"
                type="search"
                placeholder="Search records..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="space-y-4 p-4 sm:p-5">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center">
                <ClipboardList
                  size={40}
                  className="mx-auto mb-3 text-gray-300"
                />
                <p className="font-medium text-gray-700">
                  {search ? "No matching medical records" : "No medical records yet"}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  {search
                    ? "Try searching by patient, doctor, diagnosis, or record details."
                    : "Add a record to keep important patient care details together."}
                </p>
                {!search && patients.length > 0 && doctors.length > 0 && (
                  <button
                    onClick={openNewRecord}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    <Plus size={16} />
                    Add medical record
                  </button>
                )}
              </div>
            ) : (
              filteredRecords.map((record) => (
                <article
                  key={record.id}
                  className="overflow-hidden rounded-2xl border border-gray-200"
                >
                  <div className="flex flex-col gap-4 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                          <UserRound size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {record.patientName}
                          </p>
                          <p className="text-xs text-gray-500">{record.patientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Stethoscope size={16} className="text-blue-600" />
                        <span>{record.doctorName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CalendarDays size={16} />
                        <time dateTime={record.date}>{formatRecordDate(record.date)}</time>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                      <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                        {record.id}
                      </span>
                      <button
                        onClick={() => handleEdit(record)}
                        aria-label={`Edit record for ${record.patientName}`}
                        title="Edit record"
                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(record)}
                        aria-label={`Delete record for ${record.patientName}`}
                        title="Delete record"
                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-x-8 gap-y-5 p-4 sm:grid-cols-2 sm:p-5">
                    <RecordSection title="Diagnosis" content={record.diagnosis} />
                    <RecordSection title="Prescription" content={record.prescription} />
                    <RecordSection title="Doctor notes" content={record.doctorNotes} />
                    <RecordSection title="Patient history" content={record.patientHistory} />
                  </div>
                </article>
              ))
            )}
          </div>

          {filteredRecords.length > 0 && (
            <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
              Showing {filteredRecords.length} of {records.length} records
            </div>
          )}
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
            aria-labelledby="record-form-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Patient care
                </p>
                <h2
                  id="record-form-title"
                  className="mt-1 text-xl font-semibold text-gray-900"
                >
                  {editingRecord ? "Edit medical record" : "Add medical record"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Select the patient and doctor, then complete the record details.
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
                    Doctor <span className="text-rose-600">*</span>
                  </span>
                  <select
                    required
                    value={form.doctorId || ""}
                    onChange={(event) =>
                      setForm({ ...form, doctorId: Number(event.target.value) })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="" disabled>
                      Select a doctor
                    </option>
                    {doctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} · {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Record date <span className="text-rose-600">*</span>
                  </span>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      type="date"
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
                    Diagnosis <span className="text-rose-600">*</span>
                  </span>
                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    value={form.diagnosis}
                    onChange={(event) =>
                      setForm({ ...form, diagnosis: event.target.value })
                    }
                    placeholder="Diagnosis and assessment"
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Prescription
                  </span>
                  <textarea
                    rows={3}
                    maxLength={3000}
                    value={form.prescription}
                    onChange={(event) =>
                      setForm({ ...form, prescription: event.target.value })
                    }
                    placeholder="Medication, dosage, and instructions"
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Doctor notes
                  </span>
                  <textarea
                    rows={4}
                    maxLength={4000}
                    value={form.doctorNotes}
                    onChange={(event) =>
                      setForm({ ...form, doctorNotes: event.target.value })
                    }
                    placeholder="Consultation notes and follow-up plan"
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Patient history
                  </span>
                  <textarea
                    rows={4}
                    maxLength={4000}
                    value={form.patientHistory}
                    onChange={(event) =>
                      setForm({ ...form, patientHistory: event.target.value })
                    }
                    placeholder="Relevant medical history, allergies, or prior treatment"
                    className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
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
                  disabled={patients.length === 0 || doctors.length === 0}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editingRecord ? "Save changes" : "Save record"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
