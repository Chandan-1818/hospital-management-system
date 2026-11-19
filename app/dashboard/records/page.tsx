"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Plus,
  ArrowLeft,
  X,
  Pencil,
  Trash2,
  User,
  Stethoscope,
  CalendarDays,
  FileText,
  Eye,
} from "lucide-react";

type MedicalRecord = {
  id: number;
  patientName: string;
  patientId: string;
  doctorName: string;
  diagnosis: string;
  treatment: string;
  prescription: string;
  recordDate: string;
  followUpDate: string;
};

const emptyForm = {
  patientName: "",
  patientId: "",
  doctorName: "",
  diagnosis: "",
  treatment: "",
  prescription: "",
  recordDate: "",
  followUpDate: "",
};

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [form, setForm] = useState(emptyForm);

  const totalRecords = records.length;
  const todayRecords = records.filter(
    (record) => record.recordDate === new Date().toISOString().split("T")[0]
  ).length;

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      ...emptyForm,
      recordDate: new Date().toISOString().split("T")[0],
    });
    setModalOpen(true);
  };

  const openEditModal = (record: MedicalRecord) => {
    setEditingRecord(record);
    setForm({
      patientName: record.patientName,
      patientId: record.patientId,
      doctorName: record.doctorName,
      diagnosis: record.diagnosis,
      treatment: record.treatment,
      prescription: record.prescription,
      recordDate: record.recordDate,
      followUpDate: record.followUpDate,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRecord(null);
    setForm(emptyForm);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.patientName.trim() ||
      !form.patientId.trim() ||
      !form.doctorName.trim() ||
      !form.diagnosis.trim() ||
      !form.treatment.trim() ||
      !form.recordDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (editingRecord) {
      setRecords((prev) =>
        prev.map((record) =>
          record.id === editingRecord.id
            ? { ...record, ...form }
            : record
        )
      );
    } else {
      const newRecord: MedicalRecord = {
        id: Date.now(),
        ...form,
      };

      setRecords((prev) => [newRecord, ...prev]);
    }

    closeModal();
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this medical record?")) {
      setRecords((prev) => prev.filter((record) => record.id !== id));
    }
  };

  const openViewModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedRecord(null);
  };

  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-black outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 placeholder:text-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-emerald-600"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Medical Records
            </h1>
            <p className="mt-1 text-gray-500">
              Manage patient medical histories, diagnoses and treatments.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add Medical Record
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Records</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {totalRecords}
              </h2>
            </div>

            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <ClipboardList size={24} />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Today's Records</p>
              <h2 className="mt-2 text-3xl font-bold text-blue-600">
                {todayRecords}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <CalendarDays size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Medical Record List
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Patient diagnosis and treatment history
          </p>
        </div>

        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-emerald-100 p-5 text-emerald-600">
              <ClipboardList size={32} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No medical records available
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Medical records will appear here after you add patient diagnosis
              and treatment details.
            </p>

            <button
              onClick={openAddModal}
              className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={16} />
              Add First Record
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-500">
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">Doctor</th>
                  <th className="px-5 py-4 font-medium">Diagnosis</th>
                  <th className="px-5 py-4 font-medium">Record Date</th>
                  <th className="px-5 py-4 font-medium">Follow-up</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="transition hover:bg-gray-50">
                    {/* Patient */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <User size={20} />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {record.patientName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            ID: {record.patientId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Doctor */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Stethoscope size={16} className="text-gray-400" />
                        {record.doctorName}
                      </div>
                    </td>

                    {/* Diagnosis */}
                    <td className="px-5 py-4">
                      <p className="max-w-xs truncate text-sm text-gray-700">
                        {record.diagnosis}
                      </p>
                    </td>

                    {/* Record Date */}
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {formatDate(record.recordDate)}
                    </td>

                    {/* Follow-up */}
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {formatDate(record.followUpDate)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(record)}
                          title="View record"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => openEditModal(record)}
                          title="Edit record"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-100 hover:text-emerald-700"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(record.id)}
                          title="Delete record"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingRecord ? "Edit Medical Record" : "Add Medical Record"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter patient medical information below.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Patient Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Patient Name *
                  </label>

                  <input
                    type="text"
                    value={form.patientName}
                    onChange={(e) =>
                      setForm({ ...form, patientName: e.target.value })
                    }
                    placeholder="Enter patient name"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Patient ID */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Patient ID *
                  </label>

                  <input
                    type="text"
                    value={form.patientId}
                    onChange={(e) =>
                      setForm({ ...form, patientId: e.target.value })
                    }
                    placeholder="Enter patient ID"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Doctor Name *
                  </label>

                  <input
                    type="text"
                    value={form.doctorName}
                    onChange={(e) =>
                      setForm({ ...form, doctorName: e.target.value })
                    }
                    placeholder="Enter doctor name"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Record Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Record Date *
                  </label>

                  <input
                    type="date"
                    value={form.recordDate}
                    onChange={(e) =>
                      setForm({ ...form, recordDate: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>

                {/* Diagnosis */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Diagnosis *
                  </label>

                  <textarea
                    value={form.diagnosis}
                    onChange={(e) =>
                      setForm({ ...form, diagnosis: e.target.value })
                    }
                    placeholder="Enter diagnosis details"
                    rows={3}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Treatment */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Treatment *
                  </label>

                  <textarea
                    value={form.treatment}
                    onChange={(e) =>
                      setForm({ ...form, treatment: e.target.value })
                    }
                    placeholder="Enter treatment details"
                    rows={3}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Prescription */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Prescription
                  </label>

                  <textarea
                    value={form.prescription}
                    onChange={(e) =>
                      setForm({ ...form, prescription: e.target.value })
                    }
                    placeholder="Enter prescribed medications and instructions"
                    rows={3}
                    className={inputClass}
                  />
                </div>

                {/* Follow-up Date */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Follow-up Date
                  </label>

                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(e) =>
                      setForm({ ...form, followUpDate: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-300 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
                >
                  {editingRecord ? "Update Record" : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {viewModalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Medical Record Details
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Complete patient medical information
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Details */}
            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Patient Name
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedRecord.patientName}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Patient ID
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedRecord.patientId}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Doctor
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedRecord.doctorName}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-xs font-medium text-gray-500">
                    Record Date
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {formatDate(selectedRecord.recordDate)}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                  <FileText size={17} className="text-emerald-600" />
                  Diagnosis
                </h3>

                <div className="rounded-lg border border-gray-200 p-4 text-sm leading-6 text-gray-700">
                  {selectedRecord.diagnosis}
                </div>
              </div>

              {/* Treatment */}
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Treatment
                </h3>

                <div className="rounded-lg border border-gray-200 p-4 text-sm leading-6 text-gray-700">
                  {selectedRecord.treatment}
                </div>
              </div>

              {/* Prescription */}
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Prescription
                </h3>

                <div className="rounded-lg border border-gray-200 p-4 text-sm leading-6 text-gray-700">
                  {selectedRecord.prescription || "No prescription provided."}
                </div>
              </div>

              {/* Follow-up */}
              <div className="rounded-lg bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  Follow-up Date
                </p>
                <p className="mt-1 font-semibold text-emerald-900">
                  {formatDate(selectedRecord.followUpDate)}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-200 p-5">
              <button
                onClick={closeViewModal}
                className="rounded-lg bg-gray-100 px-5 py-2.5 font-medium text-gray-700 transition hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}