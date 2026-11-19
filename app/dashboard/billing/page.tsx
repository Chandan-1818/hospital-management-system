"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  ArrowLeft,
  X,
  Pencil,
  Trash2,
  User,
  CalendarDays,
  Eye,
  IndianRupee,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

type Bill = {
  id: number;
  billNumber: string;
  patientName: string;
  patientId: string;
  service: string;
  amount: number;
  tax: number;
  total: number;
  paymentStatus: "Paid" | "Pending" | "Partial";
  paymentMethod: string;
  dueDate: string;
  billDate: string;
};

const emptyForm = {
  patientName: "",
  patientId: "",
  service: "",
  amount: "",
  tax: "0",
  paymentStatus: "Pending" as "Paid" | "Pending" | "Partial",
  paymentMethod: "Cash",
  dueDate: "",
  billDate: new Date().toISOString().split("T")[0],
};

export default function BillingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [form, setForm] = useState(emptyForm);

  // Statistics
  const totalBilling = bills.reduce((sum, bill) => sum + bill.total, 0);

  const paidAmount = bills
    .filter((bill) => bill.paymentStatus === "Paid")
    .reduce((sum, bill) => sum + bill.total, 0);

  const pendingAmount = bills
    .filter((bill) => bill.paymentStatus === "Pending")
    .reduce((sum, bill) => sum + bill.total, 0);

  const partialBills = bills.filter(
    (bill) => bill.paymentStatus === "Partial"
  ).length;

  // Calculate tax and total
  const subtotal = Number(form.amount) || 0;
  const taxAmount = subtotal * ((Number(form.tax) || 0) / 100);
  const calculatedTotal = subtotal + taxAmount;

  // Modal functions
  const openAddModal = () => {
    setEditingBill(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (bill: Bill) => {
    setEditingBill(bill);

    setForm({
      patientName: bill.patientName,
      patientId: bill.patientId,
      service: bill.service,
      amount: String(bill.amount),
      tax: String(bill.tax),
      paymentStatus: bill.paymentStatus,
      paymentMethod: bill.paymentMethod,
      dueDate: bill.dueDate,
      billDate: bill.billDate,
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingBill(null);
    setForm(emptyForm);
  };

  // Save bill
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.patientName.trim() ||
      !form.patientId.trim() ||
      !form.service.trim() ||
      !form.amount ||
      !form.billDate
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (Number(form.amount) <= 0) {
      alert("Amount must be greater than zero.");
      return;
    }

    if (Number(form.tax) < 0) {
      alert("Tax cannot be negative.");
      return;
    }

    if (editingBill) {
      setBills((prev) =>
        prev.map((bill) =>
          bill.id === editingBill.id
            ? {
                ...bill,
                patientName: form.patientName,
                patientId: form.patientId,
                service: form.service,
                amount: Number(form.amount),
                tax: Number(form.tax),
                total: calculatedTotal,
                paymentStatus: form.paymentStatus,
                paymentMethod: form.paymentMethod,
                dueDate: form.dueDate,
                billDate: form.billDate,
              }
            : bill
        )
      );
    } else {
      const newBill: Bill = {
        id: Date.now(),
        billNumber: `BILL-${Date.now().toString().slice(-6)}`,
        patientName: form.patientName,
        patientId: form.patientId,
        service: form.service,
        amount: Number(form.amount),
        tax: Number(form.tax),
        total: calculatedTotal,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        dueDate: form.dueDate,
        billDate: form.billDate,
      };

      setBills((prev) => [newBill, ...prev]);
    }

    closeModal();
  };

  // Delete bill
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      setBills((prev) => prev.filter((bill) => bill.id !== id));
    }
  };

  // View bill
  const openViewModal = (bill: Bill) => {
    setSelectedBill(bill);
    setViewModalOpen(true);
  };

  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedBill(null);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (date: string) => {
    if (!date) return "—";

    return new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Status styles
  const getStatusStyle = (status: Bill["paymentStatus"]) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-orange-100 text-orange-700";
      case "Partial":
        return "bg-blue-100 text-blue-700";
    }
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
              Billing
            </h1>

            <p className="mt-1 text-gray-500">
              Manage patient bills, payments and invoices.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700"
          >
            <Plus size={18} />
            Create Bill
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* Total Billing */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Billing</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                {formatCurrency(totalBilling)}
              </h2>
            </div>

            <div className="rounded-lg bg-emerald-100 p-3 text-emerald-600">
              <Receipt size={24} />
            </div>
          </div>
        </div>

        {/* Paid */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Paid Amount</p>
              <h2 className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </h2>
            </div>

            <div className="rounded-lg bg-green-100 p-3 text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Amount</p>
              <h2 className="mt-2 text-2xl font-bold text-orange-600">
                {formatCurrency(pendingAmount)}
              </h2>
            </div>

            <div className="rounded-lg bg-orange-100 p-3 text-orange-600">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Partial */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Partial Payments</p>
              <h2 className="mt-2 text-3xl font-bold text-blue-600">
                {partialBills}
              </h2>
            </div>

            <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
              <AlertCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Bill List
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            All patient billing records
          </p>
        </div>

        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-full bg-emerald-100 p-5 text-emerald-600">
              <CreditCard size={32} />
            </div>

            <h3 className="text-lg font-semibold text-gray-900">
              No bills available
            </h3>

            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Create bills for patients to track charges and payment status.
            </p>

            <button
              onClick={openAddModal}
              className="mt-5 flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={16} />
              Create First Bill
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead className="bg-gray-50">
                <tr className="text-sm text-gray-500">
                  <th className="px-5 py-4 font-medium">Bill Number</th>
                  <th className="px-5 py-4 font-medium">Patient</th>
                  <th className="px-5 py-4 font-medium">Service</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Bill Date</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bills.map((bill) => (
                  <tr key={bill.id} className="transition hover:bg-gray-50">
                    {/* Bill Number */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-emerald-700">
                        {bill.billNumber}
                      </p>
                    </td>

                    {/* Patient */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                          <User size={20} />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900">
                            {bill.patientName}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            ID: {bill.patientId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-4">
                      <p className="max-w-xs truncate text-sm text-gray-700">
                        {bill.service}
                      </p>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {formatCurrency(bill.total)}
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {formatDate(bill.billDate)}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                          bill.paymentStatus
                        )}`}
                      >
                        {bill.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openViewModal(bill)}
                          title="View bill"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          onClick={() => openEditModal(bill)}
                          title="Edit bill"
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-emerald-100 hover:text-emerald-700"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() => handleDelete(bill.id)}
                          title="Delete bill"
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

      {/* Add / Edit Bill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingBill ? "Edit Bill" : "Create New Bill"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter billing and payment details below.
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

                {/* Service */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Service / Description *
                  </label>

                  <textarea
                    value={form.service}
                    onChange={(e) =>
                      setForm({ ...form, service: e.target.value })
                    }
                    placeholder="Enter service or billing description"
                    rows={2}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Amount (₹) *
                  </label>

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    placeholder="Enter amount"
                    className={inputClass}
                    required
                  />
                </div>

                {/* Tax */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Tax (%)
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.tax}
                    onChange={(e) =>
                      setForm({ ...form, tax: e.target.value })
                    }
                    placeholder="Enter tax percentage"
                    className={inputClass}
                  />
                </div>

                {/* Total Preview */}
                <div className="sm:col-span-2">
                  <div className="rounded-xl bg-emerald-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-emerald-700">
                          Calculated Total
                        </p>

                        <p className="mt-1 text-2xl font-bold text-emerald-800">
                          {formatCurrency(calculatedTotal)}
                        </p>
                      </div>

                      <IndianRupee size={28} className="text-emerald-600" />
                    </div>

                    <div className="mt-3 flex justify-between border-t border-emerald-100 pt-3 text-sm text-emerald-700">
                      <span>Subtotal: {formatCurrency(subtotal)}</span>
                      <span>Tax: {formatCurrency(taxAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Bill Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Bill Date *
                  </label>

                  <input
                    type="date"
                    value={form.billDate}
                    onChange={(e) =>
                      setForm({ ...form, billDate: e.target.value })
                    }
                    className={inputClass}
                    required
                  />
                </div>

                {/* Due Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Due Date
                  </label>

                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                {/* Payment Status */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Status
                  </label>

                  <select
                    value={form.paymentStatus}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        paymentStatus: e.target.value as
                          | "Paid"
                          | "Pending"
                          | "Partial",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Method
                  </label>

                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Other">Other</option>
                  </select>
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
                  {editingBill ? "Update Bill" : "Save Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bill Modal */}
      {viewModalOpen && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Bill Details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedBill.billNumber}
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Bill Details */}
            <div className="space-y-5 p-6">
              {/* Patient */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <User size={20} />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedBill.patientName}
                    </p>

                    <p className="text-sm text-gray-500">
                      Patient ID: {selectedBill.patientId}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <p className="text-sm text-gray-500">Service Description</p>
                <p className="mt-1 font-medium text-gray-900">
                  {selectedBill.service}
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Bill Date</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(selectedBill.billDate)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Due Date</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {formatDate(selectedBill.dueDate)}
                  </p>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedBill.amount)}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({selectedBill.tax}%)</span>
                    <span>
                      {formatCurrency(
                        selectedBill.amount * (selectedBill.tax / 100)
                      )}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Total Amount
                      </span>

                      <span className="text-xl font-bold text-emerald-700">
                        {formatCurrency(selectedBill.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="mt-1 font-medium text-gray-900">
                    {selectedBill.paymentMethod}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                    selectedBill.paymentStatus
                  )}`}
                >
                  {selectedBill.paymentStatus}
                </span>
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