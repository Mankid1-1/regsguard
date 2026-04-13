"use client";

import Link from "next/link";

const PROGRAMS = [
  {
    type: "WHITE_LABEL",
    title: "White-Label Partner",
    subtitle: "Your brand, our platform",
    description:
      "Launch a fully branded compliance platform under your own name, logo, and domain. Ideal for service companies, franchises, and industry leaders who want to offer compliance tracking to their network.",
    features: [
      "Custom branding (logo, colors, domain)",
      "Your own user base and admin portal",
      "Full document generation suite",
      "Priority support and onboarding",
      "Revenue share model",
    ],
    cta: "Apply for White-Label",
    color: "#1e40af",
  },
  {
    type: "REFERRAL",
    title: "Referral Partner",
    subtitle: "Earn by sharing",
    description:
      "Get a unique referral link and earn 15% recurring commission for every contractor you bring to the platform. Perfect for industry influencers, trainers, and trade school instructors.",
    features: [
      "15% recurring commission",
      "Unique referral tracking link",
      "Real-time earnings dashboard",
      "Monthly payouts via direct deposit",
      "Marketing materials provided",
    ],
    cta: "Join Referral Program",
    color: "#059669",
  },
  {
    type: "ASSOCIATION",
    title: "Association Partner",
    subtitle: "Member benefits, simplified",
    description:
      "Offer discounted compliance tracking as a member benefit. Trade associations, unions, and professional organizations get bulk pricing and a co-branded member portal.",
    features: [
      "20% member discount on subscriptions",
      "10% revenue share on member signups",
      "Co-branded member landing page",
      "Bulk onboarding tools",
      "Quarterly business reviews",
    ],
    cta: "Partner as Association",
    color: "#7c3aed",
  },
  {
    type: "ENTERPRISE",
    title: "Enterprise Partner",
    subtitle: "Built for large teams",
    description:
      "For general contractors, property management companies, and large firms managing compliance across dozens or hundreds of sub-contractors. Centralized oversight, bulk document generation, and team management.",
    features: [
      "25% volume discount",
      "Centralized contractor management",
      "Bulk document generation and filing",
      "Dedicated account manager",
      "Custom integrations and API access",
    ],
    cta: "Contact Enterprise Sales",
    color: "#dc2626",
  },
];

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-24">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            Partnership Programmes
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-200">
            Whether you&apos;re a trade association, industry influencer, or enterprise GC &mdash;
            there&apos;s a programme that lets you grow with us while serving your contractors better.
          </p>
        </div>
      </section>

      {/* Program cards */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2">
          {PROGRAMS.map((p) => (
            <div
              key={p.type}
              className="group relative flex flex-col rounded-2xl border-2 border-gray-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg"
            >
              <div
                className="mb-4 inline-block self-start rounded-full px-3 py-1 text-xs font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.subtitle}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{p.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{p.description}</p>
              <ul className="mt-6 space-y-2 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" style={{ color: p.color }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/partners/apply?type=${p.type}`}
                className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: p.color }}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Not sure which programme fits?</h2>
          <p className="mt-2 text-gray-600">
            Apply and our team will work with you to find the best fit for your organization.
          </p>
          <Link
            href="/partners/apply"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
