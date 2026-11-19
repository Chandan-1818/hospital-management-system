
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Settings,
  Hospital,
  User,
  Bell,
  Shield,
  Save,
  LockKeyhole,
  Mail,
  Phone,
  MapPin,
  Globe,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

type SettingsData = {
  hospitalName: string;
  hospitalEmail: string;
  hospitalPhone: string;
  hospitalAddress: string;
  hospitalWebsite: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  notifications: {
    appointments: boolean;
    billing: boolean;
    patients: boolean;
    reminders: boolean;
  };
};

const defaultSettings: SettingsData = {
  hospitalName: "MediCare Hospital",
  hospitalEmail: "contact@medicare.com",
  hospitalPhone: "+91 98765 43210",
  hospitalAddress: "Bengaluru, Karnataka, India",
  hospitalWebsite: "www.medicare.com",
  adminName: "Administrator",
  adminEmail: "admin@medicare.com",
  adminPhone: "+91 98765 43210",
  notifications: {
    appointments: true,
    billing: true,
    patients: true,
    reminders: false,
  },
};

const SETTINGS_KEY = "hospital-settings";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loaded, setLoaded] = useState(false);
  const [saved, setSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem(SETTINGS_KEY);

      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);

        setSettings({
          ...defaultSettings,
          ...parsed,
          notifications: {
            ...defaultSettings.notifications,
            ...parsed.notifications,
          },
        });
      }
    } catch {
      console.error("Unable to load settings.");
    }

    setLoaded(true);
  }, []);

  const updateField = (
    field: keyof SettingsData,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
    setFormError("");
  };

  const updateNotification = (
    field: keyof SettingsData["notifications"]
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: !prev.notifications[field],
      },
    }));

    setSaved(false);
  };

  const navigateToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const validateSettings = () => {
    if (!settings.hospitalName.trim()) {
      return "Hospital name is required.";
    }

    if (!settings.adminName.trim()) {
      return "Administrator name is required.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(settings.hospitalEmail)) {
      return "Enter a valid hospital email address.";
    }

    if (!emailRegex.test(settings.adminEmail)) {
      return "Enter a valid administrator email address.";
    }

    const validatePhone = (phone: string) => {
      const digits = phone.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    };

    if (!validatePhone(settings.hospitalPhone)) {
      return "Enter a valid hospital phone number.";
    }

    if (!validatePhone(settings.adminPhone)) {
      return "Enter a valid administrator phone number.";
    }

    return "";
  };

  const saveSettings = () => {
    const validationError = validateSettings();

    if (validationError) {
      setFormError(validationError);
      setSaved(false);
      return;
    }

    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));

      setFormError("");
      setSaved(true);

      setTimeout(() => setSaved(false), 3000);
    } catch {
      setFormError("Unable to save settings.");
      setSaved(false);
    }
  };

  const handlePasswordChange = () => {
    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("New password must contain at least 8 characters.");
      return;
    }

    if (newPassword === currentPassword) {
      setPasswordError(
        "Your new password must be different from your current password."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirm password do not match."
      );
      return;
    }

    setPasswordMessage(
      "Validation successful. Connect an authentication backend to change your password."
    );

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  if (!loaded) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
            <Settings size={16} />
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-emerald-600">Settings</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage hospital information and application preferences.
          </p>
        </div>

        <button
          onClick={saveSettings}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700"
        >
          {saved ? <Check size={18} /> : <Save size={18} />}
          {saved ? "Saved Successfully" : "Save Changes"}
        </button>
      </div>

      {/* Validation Error */}
      {formError && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {formError}
        </div>
      )}

      {/* Clickable Navigation */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Hospital Profile",
            icon: Hospital,
            section: "hospital-profile",
          },
          {
            label: "Admin Profile",
            icon: User,
            section: "admin-profile",
          },
          {
            label: "Notifications",
            icon: Bell,
            section: "notifications",
          },
          {
            label: "Security",
            icon: Shield,
            section: "security",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => navigateToSection(item.section)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm"
            >
              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <Icon size={19} />
              </div>

              <span className="text-sm font-medium text-gray-700">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {/* Hospital Profile */}
        <section
          id="hospital-profile"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <SectionHeader
            icon={<Hospital size={21} />}
            title="Hospital Profile"
            description="Hospital information and contact details"
          />

          <div className="p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Hospital Name"
                icon={<Hospital size={17} />}
                value={settings.hospitalName}
                onChange={(value) => updateField("hospitalName", value)}
                placeholder="Enter hospital name"
              />

              <InputField
                label="Hospital Email"
                icon={<Mail size={17} />}
                value={settings.hospitalEmail}
                onChange={(value) => updateField("hospitalEmail", value)}
                placeholder="hospital@example.com"
                type="email"
              />

              <InputField
                label="Phone Number"
                icon={<Phone size={17} />}
                value={settings.hospitalPhone}
                onChange={(value) => updateField("hospitalPhone", value)}
                placeholder="+91 XXXXX XXXXX"
              />

              <InputField
                label="Website"
                icon={<Globe size={17} />}
                value={settings.hospitalWebsite}
                onChange={(value) => updateField("hospitalWebsite", value)}
                placeholder="www.example.com"
              />

              <div className="md:col-span-2">
                <InputField
                  label="Hospital Address"
                  icon={<MapPin size={17} />}
                  value={settings.hospitalAddress}
                  onChange={(value) => updateField("hospitalAddress", value)}
                  placeholder="Enter complete hospital address"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Admin Profile */}
        <section
          id="admin-profile"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <SectionHeader
            icon={<User size={21} />}
            title="Admin Profile"
            description="Manage administrator account details"
          />

          <div className="p-5 sm:p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-xl font-semibold text-white">
                {settings.adminName
                  .trim()
                  .split(/\s+/)
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "AD"}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  {settings.adminName || "Administrator"}
                </h3>

                <p className="text-sm text-gray-500">
                  Hospital Administrator
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Full Name"
                icon={<User size={17} />}
                value={settings.adminName}
                onChange={(value) => updateField("adminName", value)}
                placeholder="Enter administrator name"
              />

              <InputField
                label="Email Address"
                icon={<Mail size={17} />}
                value={settings.adminEmail}
                onChange={(value) => updateField("adminEmail", value)}
                placeholder="admin@example.com"
                type="email"
              />

              <InputField
                label="Phone Number"
                icon={<Phone size={17} />}
                value={settings.adminPhone}
                onChange={(value) => updateField("adminPhone", value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section
          id="notifications"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <SectionHeader
            icon={<Bell size={21} />}
            title="Notifications"
            description="Choose the notifications you want to receive"
          />

          <div className="divide-y divide-gray-100">
            <NotificationItem
              title="Appointment Notifications"
              description="Receive notifications for new and updated appointments."
              checked={settings.notifications.appointments}
              onChange={() => updateNotification("appointments")}
            />

            <NotificationItem
              title="Billing Notifications"
              description="Get notified about payments, pending bills and transactions."
              checked={settings.notifications.billing}
              onChange={() => updateNotification("billing")}
            />

            <NotificationItem
              title="Patient Notifications"
              description="Receive alerts when new patients are registered."
              checked={settings.notifications.patients}
              onChange={() => updateNotification("patients")}
            />

            <NotificationItem
              title="Appointment Reminders"
              description="Enable reminders for upcoming appointments."
              checked={settings.notifications.reminders}
              onChange={() => updateNotification("reminders")}
            />
          </div>
        </section>

        {/* Security */}
        <section
          id="security"
          className="scroll-mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <SectionHeader
            icon={<Shield size={21} />}
            title="Security"
            description="Manage your password and account security"
          />

          <div className="p-5 sm:p-6">
            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-3">
                <LockKeyhole
                  size={20}
                  className="mt-0.5 text-emerald-600"
                />

                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Change Password
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Use a strong password with at least 8 characters.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showCurrentPassword}
                onToggle={() =>
                  setShowCurrentPassword(!showCurrentPassword)
                }
                placeholder="Enter current password"
              />

              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showNewPassword}
                onToggle={() => setShowNewPassword(!showNewPassword)}
                placeholder="Enter new password"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {passwordError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  {passwordMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handlePasswordChange}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <LockKeyhole size={17} />
                Update Password
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-gray-500">
            Hospital Management System
          </p>

          <button
            onClick={saveSettings}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            {saved ? <Check size={17} /> : <Save size={17} />}
            {saved ? "Settings Saved" : "Save All Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Section Header ---------------- */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-gray-100 p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
          {icon}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {title}
          </h2>

          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Reusable Input ---------------- */

function InputField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    </div>
  );
}

/* ---------------- Password Input ---------------- */

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-12 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

/* ---------------- Notification Toggle ---------------- */

function NotificationItem({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-5 sm:px-6">
      <div>
        <h3 className="text-sm font-medium text-gray-800">{title}</h3>

        <p className="mt-1 text-xs leading-5 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-checked={checked}
        role="switch"
        aria-label={title}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-emerald-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}
