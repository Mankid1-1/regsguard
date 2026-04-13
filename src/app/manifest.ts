import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RegsGuard - Trade Compliance Tracker",
    short_name: "RegsGuard",
    description: "Never miss a license renewal. Track deadlines, generate PDFs, and send compliance docs automatically.",
    start_url: "/dashboard",
    scope: "/",
    id: "/dashboard",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#ffffff",
    theme_color: "#1e40af",
    orientation: "portrait-primary",
    categories: ["business", "productivity"],
    launch_handler: {
      client_mode: "navigate-existing",
    },
    icons: [
      { src: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "maskable" },
      { src: "/icons/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        form_factor: "narrow",
        label: "RegsGuard Dashboard",
      },
      {
        src: "/icons/icon-512x512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        form_factor: "wide",
        label: "RegsGuard Dashboard",
      },
    ],
  };
}
