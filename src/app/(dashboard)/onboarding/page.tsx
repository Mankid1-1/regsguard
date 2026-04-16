"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface SmartOnboardingResult {
  success: boolean;
  profile?: {
    businessName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    phone: string;
    email: string;
    responsiblePerson: string;
  };
  detectedRegulations?: any[];
  complianceScore?: number;
  immediateDeadlines?: any[];
  estimatedSavings?: {
    timeSaved: string;
    lateFeesAvoided: number;
    stressReduction: string;
  };
  nextSteps?: string[];
  error?: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: clerkUser } = useUser();

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<SmartOnboardingResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Simple profile form
  const [profile, setProfile] = useState({
    businessName: "",
    address: "",
    city: "",
    state: "MN",
    zip: "",
    phone: "",
    email: "",
    responsiblePerson: "",
    licenseNumbers: {} as Record<string, string>,
  });

  // Pre-fill from Clerk user data
  useEffect(() => {
    if (clerkUser) {
      setProfile(prev => ({
        ...prev,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        responsiblePerson: clerkUser.fullName || "",
      }));
    }
  }, [clerkUser]);

  function handleProfileChange(field: string, value: string) {
    setProfile(prev => ({ ...prev, [field]: value }));
  }

  function handleLicenseChange(trade: string, licenseNumber: string) {
    setProfile(prev => ({
      ...prev,
      licenseNumbers: {
        ...prev.licenseNumbers,
        [trade]: licenseNumber,
      },
    }));
  }

  async function handleSubmit() {
    if (!profile.businessName.trim()) {
      toast("Please enter your business name", "error");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/smart-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data: SmartOnboardingResult = await response.json();

      if (data.success) {
        setResults(data);
        setShowResults(true);
        toast("Setup complete! Here's what we found for you.", "success");
      } else {
        throw new Error(data.error || "Setup failed");
      }
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  }

  function goToDashboard() {
    router.push("/dashboard");
    router.refresh();
  }

  // Show results after successful onboarding
  if (showResults && results) {
    return (
      <div className="mx-auto max-w-4xl py-4">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">
              Welcome to RegsGuard! 
            </CardTitle>
            <CardDescription>
              Your compliance autopilot is ready. Here's what we set up for you:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Compliance Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${
                      (results.complianceScore || 0) >= 90 ? 'text-green-600' :
                      (results.complianceScore || 0) >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {results.complianceScore || 0}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {(results.complianceScore || 0) >= 90 ? 'Excellent!' :
                       (results.complianceScore || 0) >= 70 ? 'Good start' :
                       'Needs attention'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Regulations Found */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Regulations Detected</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {results.detectedRegulations?.length || 0}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Compliance requirements to track
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Estimated Savings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Estimated Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Time saved:</span>
                      <span className="font-medium">{results.estimatedSavings?.timeSaved}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Late fees avoided:</span>
                      <span className="font-medium">${results.estimatedSavings?.lateFeesAvoided}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Stress reduction:</span>
                      <span className="font-medium">{results.estimatedSavings?.stressReduction}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Immediate Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.immediateDeadlines?.slice(0, 3).map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm truncate">{deadline.regulation.title}</span>
                        <Badge variant={
                          deadline.urgency === 'critical' ? 'destructive' :
                          deadline.urgency === 'high' ? 'warning' :
                          deadline.urgency === 'medium' ? 'default' : 'secondary'
                        }>
                          {deadline.daysUntil} days
                        </Badge>
                      </div>
                    )) || <p className="text-sm text-muted-foreground">No immediate deadlines</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Steps */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Recommended Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {results.nextSteps?.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">{step}</span>
                    </li>
                  )) || <li className="text-sm text-muted-foreground">No next steps available</li>}
                </ul>
              </CardContent>
            </Card>

            <div className="mt-6 flex justify-center">
              <Button size="lg" onClick={goToDashboard}>
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Initial onboarding form
  return (
    <div className="mx-auto max-w-2xl py-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Set Up Your Compliance Autopilot</CardTitle>
          <CardDescription>
            Enter your business information once and we'll automatically detect your compliance requirements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Business Name"
                value={profile.businessName}
                onChange={(e) => handleProfileChange("businessName", e.target.value)}
                placeholder="Your Business Name"
                required
              />
              <Input
                label="Responsible Person"
                value={profile.responsiblePerson}
                onChange={(e) => handleProfileChange("responsiblePerson", e.target.value)}
                placeholder="License holder name"
              />
            </div>

            <Input
              label="Address"
              value={profile.address}
              onChange={(e) => handleProfileChange("address", e.target.value)}
              placeholder="123 Main St"
            />

            <div className="grid gap-4 md:grid-cols-3">
              <Input
                label="City"
                value={profile.city}
                onChange={(e) => handleProfileChange("city", e.target.value)}
                placeholder="Minneapolis"
              />
              <Input
                label="State"
                value={profile.state}
                onChange={(e) => handleProfileChange("state", e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="MN"
              />
              <Input
                label="ZIP"
                value={profile.zip}
                onChange={(e) => handleProfileChange("zip", e.target.value)}
                placeholder="55401"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
                placeholder="(612) 555-1234"
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => handleProfileChange("email", e.target.value)}
                placeholder="you@business.com"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">License Numbers (Optional)</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your license numbers to help us detect your specific requirements
              </p>
              
              <div className="space-y-3">
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Contractor License"
                    placeholder="BC123456"
                    onChange={(e) => handleLicenseChange("CONTRACTOR", e.target.value)}
                  />
                  <Input
                    label="Electrical License"
                    placeholder="EL789012"
                    onChange={(e) => handleLicenseChange("ELECTRICAL", e.target.value)}
                  />
                  <Input
                    label="Plumbing License"
                    placeholder="PL345678"
                    onChange={(e) => handleLicenseChange("PLUMBING", e.target.value)}
                  />
                  <Input
                    label="HVAC License"
                    placeholder="HV901234"
                    onChange={(e) => handleLicenseChange("HVAC", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li> We'll detect your relevant MN/WI regulations automatically</li>
                  <li> Set up deadline tracking and email reminders</li>
                  <li> Create your compliance dashboard with instant insights</li>
                  <li> Enable auto-renewal for eligible licenses</li>
                </ul>
              </div>
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={submitting}
              loading={submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? "Setting up your compliance..." : "Complete Setup"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
