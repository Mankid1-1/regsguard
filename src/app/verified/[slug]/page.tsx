import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function gradeFromScore(score: number): { grade: string; label: string; color: string } {
  if (score >= 90) return { grade: "A", label: "Excellent", color: "#16a34a" };
  if (score >= 80) return { grade: "B", label: "Good", color: "#65a30d" };
  if (score >= 70) return { grade: "C", label: "Fair", color: "#ca8a04" };
  if (score >= 60) return { grade: "D", label: "Poor", color: "#ea580c" };
  return { grade: "F", label: "Critical", color: "#dc2626" };
}

export default async function VerifiedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await prisma.user.findUnique({
    where: { publicBadgeSlug: slug },
    select: {
      publicBadgeEnabled: true,
      complianceScore: true,
      complianceScoreAt: true,
      businessProfile: {
        select: {
          businessName: true,
          city: true,
          state: true,
          insuranceProvider: true,
          insuranceExpiration: true,
          bondProvider: true,
          bondExpiration: true,
        },
      },
      userDeadlines: {
        where: { status: { in: ["UPCOMING", "DUE_SOON", "COMPLETED"] } },
        select: { status: true },
      },
    },
  });

  if (!user || !user.publicBadgeEnabled) notFound();

  const score = user.complianceScore ?? 0;
  const { grade, label, color } = gradeFromScore(score);
  const business = user.businessProfile;
  const completedCount = user.userDeadlines.filter((d) => d.status === "COMPLETED").length;
  const onTimeCount = user.userDeadlines.filter((d) => d.status === "UPCOMING").length;

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "-apple-system,sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 16px" }}>
          <div style={{
            background: "white",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}>
            <div style={{ background: color, color: "white", padding: "32px 24px", textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, opacity: 0.9 }}>
                ✓ VERIFIED COMPLIANT
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, marginTop: 8 }}>
                {business?.businessName ?? "Contractor"}
              </div>
              <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>
                {business?.city && business?.state ? `${business.city}, ${business.state}` : ""}
              </div>
            </div>

            <div style={{ padding: "32px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, marginBottom: 24 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1 }}>{grade}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Grade</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 56, fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>Score / 100</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "#0f172a", lineHeight: 1, paddingTop: 14 }}>{label}</div>
                  <div style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>Status</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                <Stat label="Compliance items completed" value={completedCount} />
                <Stat label="Currently on-track" value={onTimeCount} />
                {business?.insuranceProvider && (
                  <Stat label="GL Insurance" value={business.insuranceProvider} sub={business.insuranceExpiration ? `Valid through ${new Date(business.insuranceExpiration).toLocaleDateString()}` : undefined} />
                )}
                {business?.bondProvider && (
                  <Stat label="Surety Bond" value={business.bondProvider} sub={business.bondExpiration ? `Valid through ${new Date(business.bondExpiration).toLocaleDateString()}` : undefined} />
                )}
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, fontSize: 12, color: "#94a3b8", textAlign: "center" }}>
                Last updated{" "}
                {user.complianceScoreAt ? new Date(user.complianceScoreAt).toLocaleDateString() : "never"} · Verified by{" "}
                <a href="/" style={{ color: "#1e40af", textDecoration: "none", fontWeight: 600 }}>RegsGuard</a>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#64748b" }}>
            This contractor has linked their RegsGuard compliance record to this page.
            Information is updated automatically as licenses, insurance, and bonds are renewed.
          </div>
        </div>
      </body>
    </html>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: "#f1f5f9", borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
