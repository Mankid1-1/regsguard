"use client";

import { useEffect } from "react";

/**
 * Recovers from the classic Next.js deploy-skew error:
 *
 *   ChunkLoadError: Loading chunk <n> failed
 *   Refused to execute script from '..../page-<hash>.js' because
 *   its MIME type ('text/html') is not executable
 *
 * This happens when a user's tab was loaded from a previous deploy,
 * a new deploy lands with different content-hashed chunk filenames,
 * then client-side routing asks for an old chunk hash that no longer
 * exists. The server returns 404 HTML, the browser MIME-checks it, and
 * the app goes blank.
 *
 * Fix: detect ChunkLoadError / missing-module errors and hard-reload
 * the page ONCE (guarded by a sessionStorage flag so we don't loop).
 */
export function ChunkErrorBoundary() {
  useEffect(() => {
    const handler = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error =
        "reason" in event ? (event as PromiseRejectionEvent).reason : (event as ErrorEvent).error;
      const message =
        (error && (error.message || error.toString())) || (event as ErrorEvent).message || "";

      const isChunkLoadError =
        error?.name === "ChunkLoadError" ||
        /Loading chunk \d+ failed/.test(message) ||
        /Loading CSS chunk \d+ failed/.test(message) ||
        /Refused to execute script/.test(message) ||
        /MIME type \('text\/html'\)/.test(message) ||
        (error?.name === "TypeError" && /Failed to fetch dynamically imported module/.test(message));

      if (!isChunkLoadError) return;

      // Guard against infinite reload loops: only reload once per session
      const alreadyReloaded = sessionStorage.getItem("regsguard_chunk_reload");
      if (alreadyReloaded) {
        console.warn("[ChunkErrorBoundary] Already reloaded once; not retrying to avoid loop");
        return;
      }
      sessionStorage.setItem("regsguard_chunk_reload", String(Date.now()));

      console.warn("[ChunkErrorBoundary] Stale chunks from previous deploy detected; reloading");

      // Clear the service worker cache before reload, so we don't pull
      // stale chunks from SW.
      if ("caches" in window) {
        caches.keys().then((keys) =>
          Promise.all(keys.map((key) => caches.delete(key))).finally(() => {
            window.location.reload();
          }),
        );
      } else {
        window.location.reload();
      }
    };

    window.addEventListener("error", handler);
    window.addEventListener("unhandledrejection", handler);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  return null;
}
