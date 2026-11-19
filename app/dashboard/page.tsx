"use client";

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
  Plus,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
} from "lucide-react";

import Link from "next/link";
import { useState } from "react";

const stats = [
  {
    title: "Total Patients",
    value: 0,
    change: "No patient data",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Total Doctors",
    value: 0,
    change: "No doctor data",
    icon: Stethoscope,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Appointments Today",
    value: 0,
    change: "No appointments",
    icon: CalendarDays,
    color: "bg-purple-50 text-purple-600",
  },
  {
    title: "Pending Appointments",
    value: 0,
    change: "No pending items",
    icon: Clock,
    color: "bg-orange-50 text-orange-600",
  },
];

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
  { name: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  { name: "Medical Records", href: "/dashboard/records", icon: ClipboardList },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full") +
          " lg:translate-x-0"
        }
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-6">
          <div className="rounded-xl bg-emerald-600 p-2.5 text-white">
            <Activity size={24} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
            <p className="text-xs text-gray-500">Hospital Management</p>
          </div>
        </div>

        <div className="px-4 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Main Menu
          </p>

          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition " +
                    (index === 0
                      ? "bg-emerald-50 font-medium text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100")
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom */}
        <div className="mt-auto border-t border-gray-100 px-4 py-5">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 hover:bg-gray-100"
          >
            <Settings size={19} />
            Settings
          </Link>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Users size={18} />
            </div>

            <div>
              <p className="text-sm font-medium">Account</p>
              <p className="text-xs text-gray-500">Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">

        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:px-8">

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="font-semibold text-gray-900">Dashboard</h2>
              <p className="text-xs text-gray-500">Hospital overview</p>
            </div>
          </div>

          <div className="flex items-center gap-3">

            {/* Search */}
            <div className="relative hidden sm:block">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-56 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <Bell size={20} />
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                  <p className="font-semibold">Notifications</p>

                  <p className="mt-3 text-sm text-gray-600">
                    No notifications available.
                  </p>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Users size={17} />
                </div>

                <span className="hidden text-sm font-medium md:block">
                  Account
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 z-50 w-44 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  <Link
                    href="/dashboard/settings"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    Profile & Settings
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
        <div className="p-4 md:p-8">

          {/* Welcome Section */}
          <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Hospital overview and activity.
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <Link
              href="/dashboard/appointments"
              className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              <Plus size={18} />
              New Appointment
            </Link>
          </section>

          {/* Statistics */}
          <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <div className={"rounded-xl p-2.5 " + stat.color}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <h2 className="mt-4 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>

                  <p className="mt-2 text-xs text-gray-500">
                    {stat.change}
                  </p>
                </div>
              );
            })}
          </section>

          {/* Main Grid */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

            {/* Appointments */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white xl:col-span-2">

              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Recent Appointments
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Appointment schedule
                  </p>
                </div>

                <Link
                  href="/dashboard/appointments"
                  className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  View All
                  <ArrowUpRight size={16} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">

                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-medium">Patient</th>
                      <th className="px-5 py-3 font-medium">Doctor</th>
                      <th className="px-5 py-3 font-medium">Time</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td
                        colSpan={4}
                        className="py-8 text-center text-gray-500"
                      >
                        {search
                          ? "No matching appointments."
                          : "No appointments available."}
                      </td>
                    </tr>
                  </tbody>

                </table>
              </div>
            </div>

            {/* Doctors Overview */}
            <div className="rounded-2xl border border-gray-200 bg-white">

              <div className="border-b border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900">
                  Doctors Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Hospital specialists
                </p>
              </div>

              <div className="p-8 text-center text-sm text-gray-500">
                No doctors registered.
              </div>

              <div className="px-5 pb-5">
                <Link
                  href="/dashboard/doctors"
                  className="block rounded-xl border border-gray-200 py-2.5 text-center text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  View All Doctors
                </Link>
              </div>
            </div>
          </section>

          {/* Appointment Summary */}
          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">

            {/* Confirmed */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={21} />

                <p className="text-sm font-medium text-gray-600">
                  Confirmed Appointments
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                0
              </h2>
            </div>

            {/* Pending */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Clock className="text-amber-500" size={21} />

                <p className="text-sm font-medium text-gray-600">
                  Waiting for Approval
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                0
              </h2>
            </div>

            {/* Cancelled */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-500" size={21} />

                <p className="text-sm font-medium text-gray-600">
                  Cancelled Appointments
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                0
              </h2>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
}