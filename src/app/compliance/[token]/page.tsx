import { Metadata } from "next";

interface ComplianceData {
  business: {
    name: string;
    city: string | null;
    state: string | null;
    insuranceActive: boolean;
    bondActive: boolean;
  };
  complianceScore: { score: number; grade: string };
  regulations: {
    name: string;
    trade: string;
    state: string;
    category: string;
    renewalCycle: string;
    authority: string;
  }[];
  deadlines: {
    regulation: string;
    category: string;
    status: string;
    nextDueDate: string;
    completedAt: string | null;
  }[];
  recentFilings: { action: string; date: string }[];
  portalLabel: string | null;
}

export const metadata: Metadata = {
  title: "Compliance Status | RegsGuard",
  description: "View compliance status and certifications",
};

function getScoreColor(score: number): string {
  if (score >= 90) return "#16a34a";
  if (score >= 80) return "#2563eb";
  if (score >= 70) return "#ca8a04";
  if (score >= 60) return "#ea580c";
  return "#dc2626";
}

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 text-green-800";
    case "UPCOMING":
      return "bg-blue-100 text-blue-800";
    case "DUE_SOON":
      return "bg-yellow-100 text-yellow-800";
    case "OVERDUE":
      return "bg-red-100 text-red-800";
    case "SKIPPED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function formatCategory(cat: string): string {
  return cat
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function CompliancePortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.regsguard.com";

  let data: ComplianceData | null = null;
  let errorMessage: string | null = null;

  try {
    const res = await fetch(`${appUrl}/api/compliance/share/${token}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json();
      errorMessage = err.error || "Unable to load compliance data";
    } else {
      data = await res.json();
    }
  } catch {
    errorMessage = "Unable to connect to compliance portal";
  }

  if (errorMessage || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Portal Unavailable</h1>
          <p className="text-gray-600">{errorMessage}</p>
        </div>
      </div>
    );
  }

  const { business, complianceScore, regulations, deadlines, recentFilings, portalLabel } = data;
  const scoreColor = getScoreColor(complianceScore.score);
  const scorePercent = complianceScore.score / 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - scorePercent);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business.name}</h1>
              {business.city && business.state && (
                <p className="text-sm text-gray-500 mt-1">
                  {business.city}, {business.state}
                </p>
              )}
              {portalLabel && (
                <p className="text-xs text-gray-400 mt-1">{portalLabel}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {business.insuranceActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Insured
                </span>
              )}
              {business.bondActive && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Bonded
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        {/* Compliance Score */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-36 h-36 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <circle
                  cx="60" cy="60" r="54"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold" style={{ color: scoreColor }}>
                  {complianceScore.score}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                  Grade {complianceScore.grade}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold text-gray-900">Compliance Score</h2>
              <p className="text-sm text-gray-500 mt-1">
                This score reflects the overall regulatory compliance status including
                license renewals, insurance coverage, and filing activity.
              </p>
            </div>
          </div>
        </div>

        {/* Active Regulations */}
        {regulations.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Licenses &amp; Certifications
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Regulation</th>
                    <th className="px-6 py-3 hidden sm:table-cell">Category</th>
                    <th className="px-6 py-3 hidden md:table-cell">Authority</th>
                    <th className="px-6 py-3">Trade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {regulations.map((reg, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {reg.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                        {formatCategory(reg.category)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">
                        {reg.authority}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                          {reg.trade}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Deadline Statuses */}
        {deadlines.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Compliance Deadlines
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-3">Requirement</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deadlines.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {d.regulation}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(d.status)}`}
                        >
                          {d.status === "DUE_SOON"
                            ? "Due Soon"
                            : d.status.charAt(0) + d.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {d.completedAt
                          ? `Completed ${formatDate(d.completedAt)}`
                          : formatDate(d.nextDueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {recentFilings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {recentFilings.map((f, i) => (
                <li key={i} className="px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {formatCategory(f.action)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(f.date)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            This compliance portal is provided as a courtesy. Contact the
            business directly for official documentation.
          </p>
          <a
            href="https://regsguard.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap ml-4"
          >
            Powered by RegsGuard
          </a>
        </div>
      </footer>
    </div>
  );
}
