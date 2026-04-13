"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Prefs {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  smsPhone: string | null;
  alertDays: number[];
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
}

const ALERT_DAY_OPTIONS = [60, 30, 14, 7, 1];
const DEBOUNCE_MS = 800;

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Fetch current preferences
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/user/notifications/preferences");
        if (res.ok) {
          const data = await res.json();
          setPrefs({
            emailEnabled: data.emailEnabled,
            smsEnabled: data.smsEnabled,
            pushEnabled: data.pushEnabled,
            inAppEnabled: data.inAppEnabled,
            smsPhone: data.smsPhone,
            alertDays: data.alertDays ?? [60, 30, 14, 7, 1],
            quietHoursStart: data.quietHoursStart,
            quietHoursEnd: data.quietHoursEnd,
          });
        }
      } catch {
        console.error("Failed to load notification preferences");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Debounced save
  const savePrefs = useCallback(
    (updated: Prefs) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/user/notifications/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
          if (!res.ok) throw new Error();
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("idle");
        }
      }, DEBOUNCE_MS);
    },
    []
  );

  // Update a field and trigger save
  function update(patch: Partial<Prefs>) {
    if (!prefs) return;
    const updated = { ...prefs, ...patch };
    setPrefs(updated);
    savePrefs(updated);
  }

  // Toggle an alert day in the list
  function toggleAlertDay(day: number) {
    if (!prefs) return;
    const current = prefs.alertDays;
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort((a, b) => b - a);
    update({ alertDays: next });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <svg
          className="h-5 w-5 animate-spin text-muted-foreground"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>
    );
  }

  if (!prefs) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not load notification preferences.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Channel toggles */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">
          Notification Channels
        </h4>

        <ToggleRow
          label="Email"
          description="Receive compliance alerts via email"
          checked={prefs.emailEnabled}
          onChange={(v) => update({ emailEnabled: v })}
        />

        <ToggleRow
          label="SMS"
          description="Receive text message alerts"
          checked={prefs.smsEnabled}
          onChange={(v) => update({ smsEnabled: v })}
        />

        {/* Phone input visible when SMS enabled */}
        {prefs.smsEnabled && (
          <div className="ml-12 mt-1">
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={prefs.smsPhone ?? ""}
              onChange={(e) => update({ smsPhone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="flex h-10 w-full max-w-xs rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
        )}

        <ToggleRow
          label="Push"
          description="Browser push notifications"
          checked={prefs.pushEnabled}
          onChange={(v) => update({ pushEnabled: v })}
        />

        <ToggleRow
          label="In-App"
          description="Show notifications in the app"
          checked={prefs.inAppEnabled}
          onChange={(v) => update({ inAppEnabled: v })}
        />
      </div>

      {/* Alert day thresholds */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">
          Alert Thresholds
        </h4>
        <p className="text-xs text-muted-foreground">
          Receive alerts when deadlines are this many days away
        </p>
        <div className="flex flex-wrap gap-2">
          {ALERT_DAY_OPTIONS.map((day) => (
            <label
              key={day}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                prefs.alertDays.includes(day)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:bg-accent"
              }`}
            >
              <input
                type="checkbox"
                checked={prefs.alertDays.includes(day)}
                onChange={() => toggleAlertDay(day)}
                className="sr-only"
              />
              {day} {day === 1 ? "day" : "days"}
            </label>
          ))}
        </div>
      </div>

      {/* Quiet hours */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-foreground">Quiet Hours</h4>
        <p className="text-xs text-muted-foreground">
          Suppress push and SMS notifications during these hours
        </p>
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Start
            </label>
            <input
              type="time"
              value={prefs.quietHoursStart ?? ""}
              onChange={(e) => update({ quietHoursStart: e.target.value })}
              className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
          <span className="mt-5 text-muted-foreground">to</span>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              End
            </label>
            <input
              type="time"
              value={prefs.quietHoursEnd ?? ""}
              onChange={(e) => update({ quietHoursEnd: e.target.value })}
              className="flex h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Toggle Switch Row ─── */

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
