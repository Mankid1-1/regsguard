"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { TRADES, STATES } from "@/lib/utils/constants";
import type { TradeValue, StateValue } from "@/lib/utils/constants";

interface Regulation {
  id: string;
  trade: string;
  state: string;
  title: string;
  description: string;
  authority: string;
  category: string;
  renewalCycle: string;
  fee: string | null;
}

const STEP_LABELS = ["Select Trades", "Select States", "Confirm Regulations", "Business Profile"];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: clerkUser } = useUser();

  const [step, setStep] = useState(1);
  const [selectedTrades, setSelectedTrades] = useState<TradeValue[]>([]);
  const [selectedStates, setSelectedStates] = useState<StateValue[]>([]);
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [selectedRegIds, setSelectedRegIds] = useState<string[]>([]);
  const [loadingRegs, setLoadingRegs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Profile form state
  const [profile, setProfile] = useState({
    businessName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    responsiblePerson: "",
    insuranceProvider: "",
    insurancePolicyNumber: "",
    insuranceExpiration: "",
    bondAmount: "",
    bondProvider: "",
    bondExpiration: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill profile from Clerk user data + selected state
  useEffect(() => {
    if (clerkUser && !profile.email) {
      setProfile((prev) => ({
        ...prev,
        email: prev.email || clerkUser.primaryEmailAddress?.emailAddress || "",
        responsiblePerson: prev.responsiblePerson || clerkUser.fullName || "",
      }));
    }
  }, [clerkUser, profile.email]);

  useEffect(() => {
    if (selectedStates.length === 1 && !profile.state) {
      setProfile((prev) => ({ ...prev, state: selectedStates[0] }));
    }
  }, [selectedStates, profile.state]);

  // Fetch regulations when entering step 3
  const fetchRegulations = useCallback(async () => {
    setLoadingRegs(true);
    try {
      const params = new URLSearchParams();
      if (selectedTrades.length > 0) params.set("trades", selectedTrades.join(","));
      if (selectedStates.length > 0) params.set("states", selectedStates.join(","));

      const res = await fetch(`/api/regulations?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch regulations");

      const data: Regulation[] = await res.json();
      setRegulations(data);
      // Pre-select all by default
      setSelectedRegIds(data.map((r) => r.id));
    } catch {
      toast("Failed to load regulations. Please try again.", "error");
    } finally {
      setLoadingRegs(false);
    }
  }, [selectedTrades, selectedStates, toast]);

  useEffect(() => {
    if (step === 3) {
      fetchRegulations();
    }
  }, [step, fetchRegulations]);

  function toggleTrade(trade: TradeValue) {
    setSelectedTrades((prev) =>
      prev.includes(trade)
        ? prev.filter((t) => t !== trade)
        : [...prev, trade]
    );
  }

  function toggleState(state: StateValue) {
    setSelectedStates((prev) =>
      prev.includes(state)
        ? prev.filter((s) => s !== state)
        : [...prev, state]
    );
  }

  function toggleRegulation(id: string) {
    setSelectedRegIds((prev) =>
      prev.includes(id)
        ? prev.filter((r) => r !== id)
        : [...prev, id]
    );
  }

  function handleProfileChange(field: string, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validateProfile(): boolean {
    const newErrors: Record<string, string> = {};
    // Basic email validation if provided
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      newErrors.email = "Invalid email address";
    }
    // Basic ZIP validation if provided
    if (profile.zip && !/^\d{5}(-\d{4})?$/.test(profile.zip)) {
      newErrors.zip = "Invalid ZIP code";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function finishOnboarding(skipProfile = false) {
    setSubmitting(true);
    try {
      // Save business profile (only if not skipping and has data)
      if (!skipProfile && profile.businessName.trim()) {
        const profileRes = await fetch("/api/user/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        });

        if (!profileRes.ok) {
          const err = await profileRes.json();
          throw new Error(err.error || "Failed to save profile");
        }
      }

      // Save regulation selections (also marks onboarding complete)
      const regsRes = await fetch("/api/user/regulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regulationIds: selectedRegIds }),
      });

      if (!regsRes.ok) {
        const err = await regsRes.json();
        throw new Error(err.error || "Failed to save regulations");
      }

      toast("Setup complete! Welcome to RegsGuard.", "success");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleNext() {
    if (step === 1 && selectedTrades.length === 0) {
      toast("Please select at least one trade.", "error");
      return;
    }
    if (step === 2 && selectedStates.length === 0) {
      toast("Please select at least one state.", "error");
      return;
    }
    if (step === 3 && selectedRegIds.length === 0) {
      toast("Please select at least one regulation.", "error");
      return;
    }
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }

    // Step 4: Submit with profile
    await finishOnboarding(false);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  // ── Render helpers ──

  const tradeLabel = (value: string) =>
    TRADES.find((t) => t.value === value)?.label ?? value;

  const stateLabel = (value: string) =>
    STATES.find((s) => s.value === value)?.label ?? value;

  const categoryLabel = (cat: string) =>
    cat
      .split("_")
      .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
      .join(" ");

  return (
    <div className="mx-auto max-w-2xl py-4">
      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div className="flex w-full items-center">
                  {i > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted || isActive
                          ? "bg-primary"
                          : "bg-border"
                      }`}
                    />
                  )}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 ${
                        isCompleted ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <span
                  className={`mt-1.5 hidden text-xs sm:block ${
                    isActive
                      ? "font-medium text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Select Trades */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>What trades does your business cover?</CardTitle>
            <CardDescription>
              Select all that apply. We will match you with the relevant regulations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {TRADES.map((trade) => {
                const selected = selectedTrades.includes(trade.value);
                return (
                  <button
                    key={trade.value}
                    type="button"
                    onClick={() => toggleTrade(trade.value)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{trade.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Select States */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Where do you operate?</CardTitle>
            <CardDescription>
              Select the states where you need compliance tracking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STATES.map((state) => {
                const selected = selectedStates.includes(state.value);
                return (
                  <button
                    key={state.value}
                    type="button"
                    onClick={() => toggleState(state.value)}
                    className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                      selected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                        selected
                          ? "border-primary bg-primary"
                          : "border-border"
                      }`}
                    >
                      {selected && (
                        <svg
                          className="h-3 w-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-medium">{state.label}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Confirm Regulations */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Your matching regulations</CardTitle>
            <CardDescription>
              Based on your selections, these regulations apply to your business.
              Uncheck any you want to skip.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingRegs ? (
              <div className="flex items-center justify-center py-12">
                <svg
                  className="h-6 w-6 animate-spin text-primary"
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
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading regulations...
                </span>
              </div>
            ) : regulations.length === 0 ? (
              <div className="rounded-lg bg-muted p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No regulations found for your selections. You can go back and
                  adjust your trades or states, or continue to set up your profile.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {selectedRegIds.length} of {regulations.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRegIds.length === regulations.length) {
                        setSelectedRegIds([]);
                      } else {
                        setSelectedRegIds(regulations.map((r) => r.id));
                      }
                    }}
                    className="text-primary hover:underline"
                  >
                    {selectedRegIds.length === regulations.length
                      ? "Deselect All"
                      : "Select All"}
                  </button>
                </div>
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {regulations.map((reg) => {
                    const selected = selectedRegIds.includes(reg.id);
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => toggleRegulation(reg.id)}
                        className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                          selected
                            ? "border-primary/50 bg-primary/5"
                            : "border-border opacity-60"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                            selected
                              ? "border-primary bg-primary"
                              : "border-border"
                          }`}
                        >
                          {selected && (
                            <svg
                              className="h-3 w-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{reg.title}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                            {reg.description}
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <Badge variant="default">
                              {tradeLabel(reg.trade)}
                            </Badge>
                            <Badge variant="outline">
                              {stateLabel(reg.state)}
                            </Badge>
                            <Badge variant="outline">
                              {categoryLabel(reg.category)}
                            </Badge>
                            {reg.fee && (
                              <Badge variant="warning">{reg.fee}</Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Business Profile (optional) */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Business profile</CardTitle>
            <CardDescription>
              Optional — used to auto-fill compliance forms and PDFs.
              You can always add this later in Settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                id="businessName"
                label="Business Name"
                value={profile.businessName}
                onChange={(e) =>
                  handleProfileChange("businessName", e.target.value)
                }
                error={errors.businessName}
              />
              <Input
                id="responsiblePerson"
                label="Responsible Person"
                value={profile.responsiblePerson}
                onChange={(e) =>
                  handleProfileChange("responsiblePerson", e.target.value)
                }
                error={errors.responsiblePerson}
                placeholder="Full name of the license holder"
              />
              <Input
                id="address"
                label="Address"
                value={profile.address}
                onChange={(e) =>
                  handleProfileChange("address", e.target.value)
                }
                error={errors.address}
              />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Input
                  id="city"
                  label="City"
                  value={profile.city}
                  onChange={(e) =>
                    handleProfileChange("city", e.target.value)
                  }
                  error={errors.city}
                />
                <Input
                  id="state"
                  label="State"
                  value={profile.state}
                  onChange={(e) =>
                    handleProfileChange("state", e.target.value.toUpperCase())
                  }
                  error={errors.state}
                  maxLength={2}
                  placeholder="MN"
                />
                <Input
                  id="zip"
                  label="ZIP"
                  value={profile.zip}
                  onChange={(e) =>
                    handleProfileChange("zip", e.target.value)
                  }
                  error={errors.zip}
                  placeholder="55401"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="phone"
                  label="Phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    handleProfileChange("phone", e.target.value)
                  }
                  error={errors.phone}
                  placeholder="(612) 555-1234"
                />
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    handleProfileChange("email", e.target.value)
                  }
                  error={errors.email}
                />
              </div>

              <hr className="my-2 border-border" />

              <p className="text-sm font-medium text-muted-foreground">
                Insurance & Bonding (Optional)
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="insuranceProvider"
                  label="Insurance Provider"
                  value={profile.insuranceProvider}
                  onChange={(e) =>
                    handleProfileChange("insuranceProvider", e.target.value)
                  }
                />
                <Input
                  id="insurancePolicyNumber"
                  label="Policy Number"
                  value={profile.insurancePolicyNumber}
                  onChange={(e) =>
                    handleProfileChange(
                      "insurancePolicyNumber",
                      e.target.value
                    )
                  }
                />
              </div>
              <Input
                id="insuranceExpiration"
                label="Insurance Expiration"
                type="date"
                value={profile.insuranceExpiration}
                onChange={(e) =>
                  handleProfileChange("insuranceExpiration", e.target.value)
                }
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  id="bondProvider"
                  label="Bond Provider"
                  value={profile.bondProvider}
                  onChange={(e) =>
                    handleProfileChange("bondProvider", e.target.value)
                  }
                />
                <Input
                  id="bondAmount"
                  label="Bond Amount"
                  value={profile.bondAmount}
                  onChange={(e) =>
                    handleProfileChange("bondAmount", e.target.value)
                  }
                  placeholder="$25,000"
                />
              </div>
              <Input
                id="bondExpiration"
                label="Bond Expiration"
                type="date"
                value={profile.bondExpiration}
                onChange={(e) =>
                  handleProfileChange("bondExpiration", e.target.value)
                }
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
        >
          Back
        </Button>
        <div className="flex items-center gap-3">
          {step === 4 && (
            <Button
              variant="ghost"
              onClick={() => finishOnboarding(true)}
              disabled={submitting}
            >
              Skip for now
            </Button>
          )}
          <Button
            onClick={handleNext}
            loading={submitting}
            disabled={loadingRegs}
          >
            {step === 4 ? "Save & Continue" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}
