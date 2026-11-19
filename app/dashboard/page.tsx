"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  Building2,
  CreditCard,
  Settings,
  Search,
  Bell,
  Menu,
  X,
  Activity,
  Clock,
  CheckCircle2,
  MoreHorizontal,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
  { name: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  { name: "Medical Records", href: "/dashboard/records", icon: ClipboardList },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const statistics = [
  {
    title: "Total Patients",
    value: 0,
    icon: Users,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Total Doctors",
    value: 0,
    icon: Stethoscope,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Appointments Today",
    value: 0,
    icon: CalendarDays,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Pending Appointments",
    value: 0,
    icon: Clock,
    color: "bg-orange-50 text-orange-600",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Activity size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
              <p className="text-xs text-gray-500">Hospital Management</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  item.href === "/dashboard"
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={19} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-100 p-4">
          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Activity size={20} />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800">
                  Hospital Management
                </p>
                <p className="text-xs text-gray-500">System</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="min-h-screen lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Dashboard
              </h2>
              <p className="hidden text-xs text-gray-500 sm:block">
                Hospital overview
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden w-full max-w-xs md:block">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileOpen(false);
                }}
                className="relative rounded-xl p-2.5 text-gray-600 hover:bg-gray-100"
              >
                <Bell size={20} />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                  <h3 className="font-semibold text-gray-900">
                    Notifications
                  </h3>

                  <p className="mt-3 text-sm text-gray-500">
                    No notifications available.
                  </p>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-gray-100"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700">
                  U
                </div>

                <span className="hidden text-sm font-medium text-gray-700 sm:block">
                  Account
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <Link
                    href="/dashboard/settings"
                    className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>

                  <Link
                    href="/login"
                    className="block rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Dashboard
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Overview of hospital activities and information.
              </p>
            </div>

            <Link
              href="/dashboard/appointments"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <CalendarDays size={18} />
              New Appointment
            </Link>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statistics.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.title}</p>

                      <h3 className="mt-2 text-3xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                    </div>

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                    >
                      <Icon size={23} />
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-gray-400">
                    No data available
                  </p>
                </div>
              );
            })}
          </div>

          {/* Recent Appointments */}
          <div className="mb-8 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Recent Appointments
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Appointment information
                </p>
              </div>

              <Link
                href="/dashboard/appointments"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">Patient</th>
                    <th className="px-5 py-4 font-medium">Doctor</th>
                    <th className="px-5 py-4 font-medium">Department</th>
                    <th className="px-5 py-4 font-medium">Date</th>
                    <th className="px-5 py-4 font-medium">Status</th>
                    <th className="px-5 py-4 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center"
                    >
                      <CalendarDays
                        size={36}
                        className="mx-auto mb-3 text-gray-300"
                      />

                      <p className="font-medium text-gray-600">
                        No appointments available
                      </p>

                      <p className="mt-1 text-sm text-gray-400">
                        Appointments will appear here when added.
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Doctors Overview */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Doctors Overview
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Doctor information
                  </p>
                </div>

                <Link
                  href="/dashboard/doctors"
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View All
                </Link>
              </div>

              <div className="p-5">
                <div className="py-8 text-center">
                  <Stethoscope
                    size={36}
                    className="mx-auto mb-3 text-gray-300"
                  />

                  <p className="font-medium text-gray-600">
                    No doctors registered
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    Registered doctors will appear here.
                  </p>

                  <Link
                    href="/dashboard/doctors"
                    className="mt-4 inline-block rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50"
                  >
                    Manage Doctors
                  </Link>
                </div>
              </div>
            </div>

            {/* Appointment Summary */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900">
                  Appointment Summary
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Appointment status overview
                </p>
              </div>

              <div className="space-y-5 p-5">
                {/* Scheduled */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={17} className="text-blue-500" />
                      Scheduled
                    </div>

                    <span className="font-semibold text-gray-900">0</span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-0 rounded-full bg-blue-500" />
                  </div>
                </div>

                {/* Completed */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={17} className="text-emerald-500" />
                      Completed
                    </div>

                    <span className="font-semibold text-gray-900">0</span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-0 rounded-full bg-emerald-500" />
                  </div>
                </div>

                {/* Cancelled */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MoreHorizontal size={17} className="text-orange-500" />
                      Cancelled
                    </div>

                    <span className="font-semibold text-gray-900">0</span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-2 w-0 rounded-full bg-orange-500" />
                  </div>
                </div>

                {/* Summary Footer */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-center text-sm text-gray-400">
                    No appointment data available.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 border-t border-gray-200 pt-5 text-center text-sm text-gray-400">
            Hospital Management System
          </footer>
        </div>
      </main>
    </div>
  );
}