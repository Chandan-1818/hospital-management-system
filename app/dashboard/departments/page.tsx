"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Department = {
  id: string;
  name: string;
  head: string;
  location: string;
  phone: string;
  email: string;
  description: string;
};

type DepartmentForm = Omit<Department, "id">;

const storageKey = "medicare-departments";

const emptyForm: DepartmentForm = {
  name: "",
  head: "",
  location: "",
  phone: "",
  email: "",
  description: "",
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);
  const [form, setForm] = useState<DepartmentForm>(emptyForm);

  useEffect(() => {
    try {
      const savedDepartments = window.localStorage.getItem(storageKey);
      if (savedDepartments) {
        const parsedDepartments: unknown = JSON.parse(savedDepartments);
        if (Array.isArray(parsedDepartments)) {
          setDepartments(parsedDepartments as Department[]);
        }
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    window.localStorage.setItem(storageKey, JSON.stringify(departments));
  }, [departments, storageLoaded]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;

    return departments.filter((department) =>
      [
        department.name,
        department.id,
        department.head,
        department.location,
        department.phone,
        department.email,
        department.description,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [departments, search]);

  function closeForm() {
    setForm(emptyForm);
    setEditingDepartment(null);
    setShowForm(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedForm = {
      ...form,
      name: form.name.trim(),
      head: form.head.trim(),
      location: form.location.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      description: form.description.trim(),
    };

    if (editingDepartment) {
      setDepartments((current) =>
        current.map((department) =>
          department.id === editingDepartment.id
            ? { ...department, ...normalizedForm }
            : department
        )
      );
    } else {
      const newDepartment: Department = {
        id: `DEP-${Date.now().toString().slice(-6)}`,
        ...normalizedForm,
      };
      setDepartments((current) => [newDepartment, ...current]);
    }

    closeForm();
  }

  function handleEdit(department: Department) {
    setEditingDepartment(department);
    setForm({
      name: department.name,
      head: department.head,
      location: department.location,
      phone: department.phone,
      email: department.email,
      description: department.description,
    });
    setShowForm(true);
  }

  function handleDelete(department: Department) {
    if (window.confirm(`Delete the ${department.name} department?`)) {
      setDepartments((current) =>
        current.filter((entry) => entry.id !== department.id)
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
              HOSPITAL ORGANIZATION
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Departments
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage hospital departments and their contact details.
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Add department
          </button>
        </div>

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Building2 size={23} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {departments.length}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Department list</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search and manage registered departments.
              </p>
            </div>
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                aria-label="Search departments"
                type="search"
                placeholder="Search departments..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Department</th>
                  <th className="px-5 py-4 font-semibold">Department head</th>
                  <th className="px-5 py-4 font-semibold">Location</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Building2
                        size={40}
                        className="mx-auto mb-3 text-gray-300"
                      />
                      <p className="font-medium text-gray-700">
                        {search
                          ? "No matching departments"
                          : "No departments added yet"}
                      </p>
                      <p className="mt-1 text-sm text-gray-400">
                        {search
                          ? "Try another department name, head, or location."
                          : "Add a department to start organizing your hospital."}
                      </p>
                      {!search && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                        >
                          <Plus size={16} />
                          Add department
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredDepartments.map((department) => (
                    <tr
                      key={department.id}
                      className="border-t border-gray-100 transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {department.name}
                            </p>
                            <p className="text-xs text-gray-500">{department.id}</p>
                            {department.description && (
                              <p className="mt-1 max-w-xs text-xs text-gray-500">
                                {department.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {department.head ? (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <UserRound size={15} className="text-gray-400" />
                            {department.head}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {department.location ? (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin size={15} className="shrink-0 text-gray-400" />
                            {department.location}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not specified</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          {department.phone && (
                            <p className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-gray-400" />
                              {department.phone}
                            </p>
                          )}
                          {department.email && (
                            <p className="flex items-center gap-2 text-xs text-gray-500">
                              <Mail size={14} className="text-gray-400" />
                              {department.email}
                            </p>
                          )}
                          {!department.phone && !department.email && (
                            <span className="text-sm text-gray-400">No contact</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(department)}
                            aria-label={`Edit ${department.name}`}
                            title="Edit department"
                            className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(department)}
                            aria-label={`Delete ${department.name}`}
                            title="Delete department"
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
            Showing {filteredDepartments.length} of {departments.length} departments
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
            aria-labelledby="department-form-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-gray-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  Department details
                </p>
                <h2
                  id="department-form-title"
                  className="mt-1 text-xl font-semibold text-gray-900"
                >
                  {editingDepartment ? "Edit department" : "Add department"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the department information below.
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
                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department name <span className="text-rose-600">*</span>
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
                    placeholder="e.g. Cardiology"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Department head
                  </span>
                  <div className="relative">
                    <UserRound
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      maxLength={100}
                      type="text"
                      value={form.head}
                      onChange={(event) =>
                        setForm({ ...form, head: event.target.value })
                      }
                      placeholder="Head of department"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Location
                  </span>
                  <div className="relative">
                    <MapPin
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      maxLength={100}
                      type="text"
                      value={form.location}
                      onChange={(event) =>
                        setForm({ ...form, location: event.target.value })
                      }
                      placeholder="Building, floor, or wing"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label>
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone number
                  </span>
                  <div className="relative">
                    <Phone
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      maxLength={30}
                      type="tel"
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      placeholder="Department phone"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

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
                      maxLength={254}
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      placeholder="department@hospital.com"
                      className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </label>

                <label className="sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Description
                  </span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Briefly describe the department's services"
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
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {editingDepartment ? "Save changes" : "Add department"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
