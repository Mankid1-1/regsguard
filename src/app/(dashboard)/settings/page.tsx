"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { NotificationPreferences } from "@/components/notifications/notification-preferences";
import { useTranslation } from "@/lib/i18n/use-translation";

const LOCALE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Espanol" },
];

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const { toast } = useToast();
  const { t, locale, setLocale } = useTranslation();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [pwError, setPwError] = useState("");

  // Appearance state
  const [darkMode, setDarkMode] = useState(false);
  const [savingDarkMode, setSavingDarkMode] = useState(false);

  // Language state
  const [savingLocale, setSavingLocale] = useState(false);

  // Load user preferences on mount
  useEffect(() => {
    async function loadPrefs() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          // The user model has darkMode and locale
          // They may be on the user record itself (from schema)
        }
      } catch {
        // Non-critical, use defaults
      }
    }
    loadPrefs();
  }, []);

  async function handleChangePassword() {
    setPwError("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast("Password updated.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDarkModeToggle() {
    const newValue = !darkMode;
    setDarkMode(newValue);
    setSavingDarkMode(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ darkMode: newValue }),
      });
      if (!res.ok) throw new Error();
      toast(newValue ? "Dark mode enabled" : "Dark mode disabled", "success");
    } catch {
      setDarkMode(!newValue); // revert on error
      toast("Failed to update appearance", "error");
    } finally {
      setSavingDarkMode(false);
    }
  }

  async function handleLocaleChange(newLocale: string) {
    setLocale(newLocale as "en" | "es");
    setSavingLocale(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: newLocale }),
      });
      if (!res.ok) throw new Error();
      toast(t("settings.saved"), "success");
    } catch {
      toast(t("common.error"), "error");
    } finally {
      setSavingLocale(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("settings.title")}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.profile")}</CardTitle>
          <CardDescription>Your login information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p className="text-sm">{user?.fullName ?? "\u2014"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-sm">{user?.primaryEmailAddress?.emailAddress ?? "\u2014"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="text-sm capitalize">{(user?.publicMetadata?.role as string)?.toLowerCase() ?? "user"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.security")}</CardTitle>
          <CardDescription>Must be at least 8 characters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwError && (
            <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {pwError}
            </div>
          )}
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Button onClick={handleChangePassword} loading={changingPassword}>
            {t("settings.save")}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.notifications")}</CardTitle>
          <CardDescription>
            Choose how and when you receive compliance alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationPreferences />
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.theme")}</CardTitle>
          <CardDescription>Customize the look of the app</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">
                Use a dark color scheme
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={darkMode}
              disabled={savingDarkMode}
              onClick={handleDarkModeToggle}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 ${
                darkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  darkMode ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.language")}</CardTitle>
          <CardDescription>
            Choose your preferred language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {LOCALE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                disabled={savingLocale}
                onClick={() => handleLocaleChange(opt.value)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  locale === opt.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
