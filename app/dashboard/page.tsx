
"use client";

import {
  LayoutDashboard,
  Users,
  Stethoscope,
  CalendarDays,
  ClipboardList,
  Building2,
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
import { useEffect, useMemo, useState } from "react";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
  specialization?: string;
  department?: string;
  availability?: string;
}

interface Appointment {
  id: string;
  patientId?: string;
  doctorId?: string;
  patient?: Patient;
  doctor?: Doctor;
  patientName?: string;
  doctorName?: string;
  date: string;
  time: string;
  reason?: string;
  status: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId?: string;
  patientName?: string;
  doctorName?: string;
  diagnosis: string;
  treatment: string;
  recordDate: string;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Patients", href: "/dashboard/patients", icon: Users },
  { name: "Doctors", href: "/dashboard/doctors", icon: Stethoscope },
  { name: "Appointments", href: "/dashboard/appointments", icon: CalendarDays },
  { name: "Medical Records", href: "/dashboard/records", icon: ClipboardList },
  { name: "Departments", href: "/dashboard/departments", icon: Building2 },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  scheduled: "bg-blue-100 text-blue-700",
};

function normalizeStatus(status?: string) {
  return (status || "Pending").toLowerCase().trim();
}

function getStatusColor(status: string) {
  return statusColors[normalizeStatus(status)] || "bg-gray-100 text-gray-600";
}

function getPatientName(appointment: Appointment) {
  return appointment.patient?.name || appointment.patientName || "Unknown Patient";
}

function getDoctorName(appointment: Appointment) {
  return appointment.doctor?.name || appointment.doctorName || "Unknown Doctor";
}

function getLocalDateKey(value: string | Date) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value: string) {
  if (!value) return "N/A";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value: string) {
  if (!value) return "N/A";

  if (/am|pm/i.test(value)) {
    return value;
  }

  const match = value.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) return value;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  const date = new Date(2000, 0, 1, hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [today, setToday] = useState("");
  const [displayDate, setDisplayDate] = useState("");

  useEffect(() => {
    const currentDate = new Date();

    setToday(getLocalDateKey(currentDate));

    setDisplayDate(
      currentDate.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError("");

        const [
          patientsResponse,
          doctorsResponse,
          appointmentsResponse,
          recordsResponse,
        ] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/doctors"),
          fetch("/api/appointments"),
          fetch("/api/records"),
        ]);

        if (
          !patientsResponse.ok ||
          !doctorsResponse.ok ||
          !appointmentsResponse.ok ||
          !recordsResponse.ok
        ) {
          throw new Error("Failed to load dashboard data.");
        }

        const [patientsData, doctorsData, appointmentsData, recordsData] =
          await Promise.all([
            patientsResponse.json(),
            doctorsResponse.json(),
            appointmentsResponse.json(),
            recordsResponse.json(),
          ]);

        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
        setAppointments(
          Array.isArray(appointmentsData) ? appointmentsData : []
        );
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError("Unable to load dashboard data. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const todaysAppointments = useMemo(() => {
    if (!today) return [];

    return appointments.filter(
      (appointment) => getLocalDateKey(appointment.date) === today
    );
  }, [appointments, today]);

  const pendingAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => normalizeStatus(appointment.status) === "pending"
      ),
    [appointments]
  );

  const confirmedAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => normalizeStatus(appointment.status) === "confirmed"
      ),
    [appointments]
  );

  const cancelledAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => normalizeStatus(appointment.status) === "cancelled"
      ),
    [appointments]
  );

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
        const dateB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();

        return dateB - dateA;
      })
      .filter((appointment) => {
        const searchText = search.toLowerCase();

        return (
          getPatientName(appointment).toLowerCase().includes(searchText) ||
          getDoctorName(appointment).toLowerCase().includes(searchText) ||
          (appointment.reason || "").toLowerCase().includes(searchText) ||
          (appointment.status || "").toLowerCase().includes(searchText)
        );
      })
      .slice(0, 5);
  }, [appointments, search]);

  const doctorsPreview = doctors.slice(0, 4);

  const stats = [
    {
      title: "Total Patients",
      value: patients.length,
      change: "Registered patients",
      icon: Users,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Total Doctors",
      value: doctors.length,
      change: "Registered specialists",
      icon: Stethoscope,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Appointments Today",
      value: todaysAppointments.length,
      change: "Today's schedule",
      icon: CalendarDays,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Appointments",
      value: pendingAppointments.length,
      change: "Awaiting confirmation",
      icon: Clock,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Medical Records",
      value: records.length,
      change: "Total patient records",
      icon: ClipboardList,
      color: "bg-pink-50 text-pink-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
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
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    index === 0
                      ? "bg-emerald-50 font-medium text-emerald-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={19} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom */}
        <div className="mt-auto border-t border-gray-100 px-4 py-5">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 hover:bg-gray-100"
          >
            <Settings size={19} />
            Settings
          </Link>

          <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
              <Users size={18} />
            </div>

            <div>
              <p className="text-sm font-medium">Account</p>
              <p className="text-xs text-gray-500">Profile</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
              aria-label="Open sidebar"
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
                placeholder="Search appointments..."
                className="w-56 rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="relative rounded-lg p-2 hover:bg-gray-100"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                  <p className="font-semibold">Notifications</p>

                  <p className="mt-3 text-sm text-gray-600">
                    {pendingAppointments.length > 0
                      ? `You have ${pendingAppointments.length} pending appointment(s).`
                      : "No notifications available."}
                  </p>
                </div>
              )}
            </div>

            {/* Account */}
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

        {/* Dashboard body */}
        <div className="p-4 md:p-8">
          {/* Welcome section */}
          <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome</h1>

              <p className="mt-1 text-sm text-gray-500">
                Hospital overview and activity.
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {displayDate || "Loading date..."}
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

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Statistics */}
          <section className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">{stat.title}</p>

                    <div className={`rounded-xl p-2.5 ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>

                  <h2 className="mt-4 text-3xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </h2>

                  <p className="mt-2 text-xs text-gray-500">{stat.change}</p>
                </div>
              );
            })}
          </section>

          {/* Recent appointments and doctors */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* Recent appointments */}
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
                    {loading ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-8 text-center text-gray-500"
                        >
                          Loading appointments...
                        </td>
                      </tr>
                    ) : recentAppointments.length === 0 ? (
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
                    ) : (
                      recentAppointments.map((appointment) => (
                        <tr
                          key={appointment.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-900">
                              {getPatientName(appointment)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {formatDate(appointment.date)}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {getDoctorName(appointment)}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {formatTime(appointment.time)}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusColor(
                                appointment.status
                              )}`}
                            >
                              {appointment.status || "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Doctors overview */}
            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 p-5">
                <h2 className="font-semibold text-gray-900">
                  Doctors Overview
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Hospital specialists
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    Loading doctors...
                  </div>
                ) : doctorsPreview.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    No doctors registered.
                  </div>
                ) : (
                  doctorsPreview.map((doctor) => (
                    <div
                      key={doctor.id}
                      className="flex items-center gap-3 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <Stethoscope size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {doctor.name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {doctor.specialization ||
                            doctor.department ||
                            "Specialist"}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          doctor.availability?.toLowerCase() === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {doctor.availability || "Available"}
                      </span>
                    </div>
                  ))
                )}
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

          {/* Appointment status summary */}
          <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={21} />

                <p className="text-sm font-medium text-gray-600">
                  Confirmed Appointments
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {loading ? "..." : confirmedAppointments.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Clock className="text-amber-500" size={21} />

                <p className="text-sm font-medium text-gray-600">
                  Waiting for Approval
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {loading ? "..." : pendingAppointments.length}
              </h2>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <XCircle className="text-red-500" size={21} />

                <p className="text-sm font-medium text-gray-600">
                  Cancelled Appointments
                </p>
              </div>

              <h2 className="mt-4 text-2xl font-bold text-gray-900">
                {loading ? "..." : cancelledAppointments.length}
              </h2>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
