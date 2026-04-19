import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuideBySlug, getRelatedGuides } from "@/lib/seo-guides/data";
import { Footer } from "@/components/layout/footer";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import { TenantLogo } from "@/components/ui/tenant-logo";

// Pre-generate static params at build time for all guides (fast, SEO-friendly)
export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

// Per-page meta — unique title, description, canonical, OG, JSON-LD
export async function generateMetadata(
  props: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await props.params;
  const guide = getGuideBySlug(slug);
  if (!guide) return { title: "Guide not found" };

  const url = `https://regsguard.rebooked.org/guides/${slug}`;
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
      siteName: "RegsGuard",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
    keywords: guide.og?.keywords,
  };
}

export default async function GuidePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const guide = getGuideBySlug(slug);
  if (!guide) notFound();

  const related = getRelatedGuides(guide);
  const tenant = await getTenantFromHeaders();

  // JSON-LD structured data: Article + FAQPage. Huge SERP boost when Google picks it up.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        author: { "@type": "Organization", name: "RegsGuard" },
        publisher: {
          "@type": "Organization",
          name: "RegsGuard",
          url: "https://regsguard.rebooked.org",
        },
        mainEntityOfPage: `https://regsguard.rebooked.org/guides/${guide.slug}`,
        datePublished: "2026-01-01",
        dateModified: new Date().toISOString().split("T")[0],
      },
      {
        "@type": "FAQPage",
        mainEntity: guide.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <TenantLogo tenant={tenant} size="md" />
            <span className="text-xl font-bold">{tenant.name}</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/guides" className="hover:text-primary">All Guides</Link>
            <Link href="/audit" className="hover:text-primary">Free Audit</Link>
            <Link href="/sign-up" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">Start Free Trial</Link>
          </nav>
        </div>
      </header>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="mx-auto max-w-3xl px-4 py-10">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          {" · "}
          <Link href="/guides" className="hover:text-foreground">Guides</Link>
          {" · "}
          <span className="capitalize">{guide.category}</span>
        </nav>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{guide.title}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-8">{guide.leadAnswer}</p>

        {/* Quick facts box — rich snippet candidate */}
        <div className="mb-10 rounded-xl border border-border bg-muted/30 p-6">
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-primary">Quick Facts</div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {guide.quickFacts.map((f) => (
              <div key={f.label}>
                <dt className="text-xs text-muted-foreground">{f.label}</dt>
                <dd className="text-sm font-semibold">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Body sections */}
        <article className="prose prose-neutral dark:prose-invert max-w-none">
          {guide.sections.map((s, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-xl font-bold mb-3">{s.heading}</h2>
              <p className="text-base leading-relaxed text-foreground/90">{s.body}</p>
            </section>
          ))}
        </article>

        {/* CTA box */}
        <div className="my-12 rounded-xl border-2 border-primary bg-primary/5 p-8 text-center">
          <h2 className="text-xl font-bold mb-3">{guide.cta.heading}</h2>
          <p className="text-sm text-muted-foreground mb-6">
            RegsGuard auto-files MN/WI license renewals, tracks CE hours, and generates every document you need — from $19/mo.
            14-day free trial, card required at signup, no charge for 14 days.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {guide.cta.button}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>

        {/* FAQ section — also shown as JSON-LD above for SERP rich snippets */}
        {guide.faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {guide.faqs.map((f, i) => (
                <details key={i} className="rounded-lg border border-border p-4">
                  <summary className="cursor-pointer font-semibold">{f.q}</summary>
                  <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related guides — internal linking for SEO */}
        {related.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-bold mb-4">Related Guides</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/guides/${r.slug}`}
                  className="rounded-lg border border-border p-4 hover:border-primary transition-colors"
                >
                  <div className="text-sm font-semibold">{r.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Small sub-CTA */}
        <div className="mb-8 rounded-lg bg-muted/50 p-4 text-center text-sm">
          <strong>Tracking this regulation manually is how contractors miss deadlines.</strong>{" "}
          <Link href="/sign-up" className="text-primary hover:underline">
            Start your 14-day free trial →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
