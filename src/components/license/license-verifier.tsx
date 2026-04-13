"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

const TRADES = [
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "HVAC", label: "HVAC" },
  { value: "GENERAL", label: "General Contractor" },
  { value: "ROOFING", label: "Roofing" },
  { value: "CARPENTRY", label: "Carpentry" },
  { value: "MASONRY", label: "Masonry" },
  { value: "PAINTING", label: "Painting" },
  { value: "LANDSCAPING", label: "Landscaping" },
  { value: "FIRE_PROTECTION", label: "Fire Protection" },
  { value: "ELEVATOR", label: "Elevator" },
  { value: "DEMOLITION", label: "Demolition" },
  { value: "OTHER", label: "Other" },
];

interface VerificationResult {
  status: "verified" | "not_found" | "expired";
  licenseHolder: string | null;
  expirationDate: string | null;
  trade: string;
  state: string;
  licenseNumber: string;
}

export function LicenseVerifier() {
  const { toast } = useToast();

  const [form, setForm] = useState({
    state: "",
    trade: "",
    licenseNumber: "",
  });
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear result when inputs change
    setResult(null);
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    if (!form.state) {
      toast("Please select a state.", "error");
      return;
    }
    if (!form.trade) {
      toast("Please select a trade.", "error");
      return;
    }
    if (!form.licenseNumber.trim()) {
      toast("License number is required.", "error");
      return;
    }

    setVerifying(true);
    setResult(null);

    try {
      const res = await fetch("/api/license-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: form.state,
          trade: form.trade,
          licenseNumber: form.licenseNumber.trim(),
        }),
      });

      if (res.ok) {
        const data: VerificationResult = await res.json();
        setResult(data);
      } else {
        const data = await res.json();
        toast(data.error || "Verification failed.", "error");
      }
    } catch {
      toast("An error occurred.", "error");
    }

    setVerifying(false);
  }

  const statusConfig = {
    verified: {
      badge: "success" as const,
      label: "Verified",
      icon: (
        <svg
          className="h-8 w-8 text-success"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
      ),
      bg: "bg-success/5 border-success/20",
    },
    not_found: {
      badge: "warning" as const,
      label: "Not Found",
      icon: (
        <svg
          className="h-8 w-8 text-warning"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      ),
      bg: "bg-warning/5 border-warning/20",
    },
    expired: {
      badge: "danger" as const,
      label: "Expired",
      icon: (
        <svg
          className="h-8 w-8 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bg: "bg-danger/5 border-danger/20",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <svg
            className="h-5 w-5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
            />
          </svg>
          License Verification
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Quickly verify a contractor or subcontractor license. Enter the details
          below to check status.
        </p>

        <form onSubmit={handleVerify} className="space-y-4">
          {/* State dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="verify-state"
              className="block text-sm font-medium text-foreground"
            >
              State *
            </label>
            <select
              id="verify-state"
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              <option value="">Select state...</option>
              {US_STATES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Trade dropdown */}
          <div className="space-y-1.5">
            <label
              htmlFor="verify-trade"
              className="block text-sm font-medium text-foreground"
            >
              Trade *
            </label>
            <select
              id="verify-trade"
              value={form.trade}
              onChange={(e) => set("trade", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              <option value="">Select trade...</option>
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* License number */}
          <Input
            id="verify-license"
            label="License Number *"
            value={form.licenseNumber}
            onChange={(e) => set("licenseNumber", e.target.value)}
            placeholder="e.g. PLB-123456"
          />

          <Button type="submit" className="w-full" loading={verifying}>
            Verify License
          </Button>
        </form>

        {/* Result */}
        {result && (
          <div
            className={`mt-6 rounded-xl border p-5 ${statusConfig[result.status].bg}`}
          >
            <div className="flex items-start gap-4">
              {statusConfig[result.status].icon}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={statusConfig[result.status].badge}>
                    {statusConfig[result.status].label}
                  </Badge>
                  <span className="text-sm font-medium">
                    {result.licenseNumber}
                  </span>
                </div>

                {result.status === "not_found" ? (
                  <p className="text-sm text-muted-foreground">
                    No license found matching this number in{" "}
                    {US_STATES.find((s) => s.value === result.state)?.label ||
                      result.state}
                    . Double-check the number and try again.
                  </p>
                ) : (
                  <div className="space-y-1 text-sm">
                    {result.licenseHolder && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground font-medium">
                          Holder:
                        </span>
                        <span>{result.licenseHolder}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-medium">
                        Trade:
                      </span>
                      <span>
                        {TRADES.find((t) => t.value === result.trade)?.label ||
                          result.trade}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-muted-foreground font-medium">
                        State:
                      </span>
                      <span>
                        {US_STATES.find((s) => s.value === result.state)
                          ?.label || result.state}
                      </span>
                    </div>
                    {result.expirationDate && (
                      <div className="flex gap-2">
                        <span className="text-muted-foreground font-medium">
                          Expires:
                        </span>
                        <span>
                          {new Date(result.expirationDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {result.status === "expired" && (
                  <p className="text-xs text-danger mt-2">
                    This license has expired. The holder must renew before
                    performing licensed work.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
