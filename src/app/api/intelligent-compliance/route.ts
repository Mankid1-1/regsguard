import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { IntelligentComplianceEngine } from "@/lib/intelligent-compliance-engine";
import { z } from "zod";
import { validationSchemas } from "@/lib/security";

const predictionSchema = z.object({
  timeframe: z.enum(['30-days', '90-days', '1-year']).optional().default('90-days'),
});

const workflowSchema = z.object({
  goal: z.enum(['cost_reduction', 'risk_minimization', 'efficiency', 'growth']),
});

export async function POST(request: NextRequest) {
  try {
    const user = await getDbUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limited = await rateLimit(user.id, { limit: 5, windowSec: 300 });
    if (limited) return limited;

    const body = await request.json();
    const { type, ...data } = body;

    switch (type) {
      case 'prediction':
        return await handlePrediction(user.id, data);
      case 'workflow':
        return await handleWorkflow(user.id, data);
      case 'insights':
        return await handleInsights(user.id);
      case 'timing':
        return await handleTiming(user.id, data);
      default:
        return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Intelligent compliance API error:", error);
    return NextResponse.json(
      { error: "Failed to process intelligent compliance request" },
      { status: 500 }
    );
  }
}

async function handlePrediction(userId: string, data: any) {
  const parsed = predictionSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const prediction = await IntelligentComplianceEngine.generateCompliancePrediction(
    userId,
    parsed.data.timeframe
  );

  return NextResponse.json({ success: true, prediction });
}

async function handleWorkflow(userId: string, data: any) {
  const parsed = workflowSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation error", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const workflow = await IntelligentComplianceEngine.generateComplianceWorkflow(
    userId,
    parsed.data.goal
  );

  return NextResponse.json({ success: true, workflow });
}

async function handleInsights(userId: string) {
  const insights = await IntelligentComplianceEngine.generateBusinessInsights(userId);
  return NextResponse.json({ success: true, insights });
}

async function handleTiming(userId: string, data: any) {
  const { regulationId } = data;
  
  if (!regulationId) {
    return NextResponse.json({ error: "Regulation ID required" }, { status: 400 });
  }

  const timing = await IntelligentComplianceEngine.predictOptimalRenewalTiming(
    userId,
    regulationId
  );

  return NextResponse.json({ success: true, timing });
}
