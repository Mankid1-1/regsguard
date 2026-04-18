import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TenantProvider } from "@/components/providers/tenant-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { ServiceWorkerRegister } from "@/components/providers/sw-register";
import { AnalyticsProvider } from "@/components/providers/analytics-provider";
import { ToastProvider } from "@/components/ui/toast";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ChunkErrorBoundary } from "@/components/chunk-error-boundary";
import { getTenantFromHeaders } from "@/lib/tenant.server";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getTenantFromHeaders();
  return {
    title: { default: tenant.name, template: `%s | ${tenant.name}` },
    description: `Trade compliance tracking — ${tenant.name}. Never miss a renewal deadline.`,
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: tenant.name,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1e40af",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenantFromHeaders();

  const cssOverrides = `
    :root {
      --primary: ${tenant.primaryColor};
      --ring: ${tenant.primaryColor};
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssOverrides }} />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ClerkProvider>
          <ToastProvider>
            <ThemeProvider>
              <LocaleProvider>
                <TenantProvider config={tenant}>{children}</TenantProvider>
              </LocaleProvider>
            </ThemeProvider>
            <ServiceWorkerRegister />
            <AnalyticsProvider />
            <CookieConsent />
            <ChunkErrorBoundary />
          </ToastProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
