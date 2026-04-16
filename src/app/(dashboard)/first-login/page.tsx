"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Quick-Win First Login Flow
 * Goal: Show value in 2 minutes before asking for profile setup
 */
export default function FirstLoginFlow() {
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [complianceData, setComplianceData] = useState<{
    overdue: number;
    dueSoon: number;
    onTrack: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/dashboard/snapshot");
        if (res.ok) {
          const data = await res.json();
          setComplianceData(data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
          <p className="text-gray-600">Analyzing your compliance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {/* Step 1: Compliance Snapshot */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hey {clerkUser?.firstName || "there"}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's your compliance snapshot
          </p>
        </div>

        {/* Snapshot Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-red-600">
                {complianceData?.overdue || 0}
              </div>
              <div className="text-sm text-red-700 mt-1">Overdue</div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {complianceData?.dueSoon || 0}
              </div>
              <div className="text-sm text-yellow-700 mt-1">Due Soon</div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {complianceData?.onTrack || 0}
              </div>
              <div className="text-sm text-green-700 mt-1">On Track</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Action */}
        <Card className="border-2 border-blue-300 mb-8">
          <CardContent className="pt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ⚡ Generate Your Next Document
            </h2>
            <p className="text-gray-600 mb-6">
              Auto-filled, ready to send to your local authority in 60 seconds.
            </p>
            <Button className="w-full mb-3">
              Generate Document Now
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/onboarding")}
            >
              Set Up Profile First
            </Button>
          </CardContent>
        </Card>

        {/* Share Win */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Did we help? Share your compliance win on social:
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="flex-1">
                Share on LinkedIn
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Share on Facebook
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
