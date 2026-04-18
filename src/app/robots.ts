import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://regsguard.rebooked.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/sign-in", "/sign-up", "/terms", "/privacy", "/partners", "/verified/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/documents",
          "/regulations",
          "/clients",
          "/projects",
          "/expenses",
          "/invoices",
          "/calendar",
          "/ce-credits",
          "/compliance",
          "/profile",
          "/settings",
          "/billing",
          "/team",
          "/onboarding",
          "/first-login",
          "/admin",
          "/auto-renewal",
          "/license-verification",
          "/_next/",
        ],
      },
      // Block known AI scrapers if desired (keep conservative: allow)
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
