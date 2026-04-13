"use client";

/**
 * Analytics abstraction — currently uses PostHog.
 *
 * Requires env var: NEXT_PUBLIC_POSTHOG_KEY
 * Optional: NEXT_PUBLIC_POSTHOG_HOST (defaults to PostHog Cloud)
 *
 * All calls are no-ops when the key is not configured.
 */

let posthogInstance: PostHogClient | null = null;

interface PostHogClient {
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, traits?: Record<string, unknown>) => void;
  reset: () => void;
}

function getPostHog(): PostHogClient | null {
  if (typeof window === "undefined") return null;

  if (posthogInstance) return posthogInstance;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;

  try {
    // Lazy-load PostHog from CDN to avoid bundle size impact
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

    // Use the window object for the PostHog snippet
    const w = window as unknown as Record<string, unknown>;
    if (!w.posthog) {
      // Minimal PostHog queue loader
      const queue: unknown[][] = [];
      const ph = {
        capture: (...args: unknown[]) => queue.push(["capture", ...args]),
        identify: (...args: unknown[]) => queue.push(["identify", ...args]),
        reset: () => queue.push(["reset"]),
        _q: queue,
      };
      w.posthog = ph;

      // Load PostHog script
      const script = document.createElement("script");
      script.src = `${host}/static/array.js`;
      script.async = true;
      script.onload = () => {
        const loaded = w.posthog as Record<string, unknown>;
        if (typeof loaded.init === "function") {
          (loaded.init as (key: string, config: Record<string, unknown>) => void)(key, {
            api_host: host,
            loaded: (posthog: PostHogClient) => {
              // Replay queued events
              for (const item of queue) {
                const [method, ...args] = item;
                const fn = posthog[method as keyof PostHogClient];
                if (typeof fn === "function") {
                  (fn as (...a: unknown[]) => void).apply(posthog, args);
                }
              }
            },
          });
        }
      };
      document.head.appendChild(script);

      posthogInstance = ph as unknown as PostHogClient;
      return posthogInstance;
    }

    posthogInstance = w.posthog as PostHogClient;
    return posthogInstance;
  } catch {
    return null;
  }
}

export const analytics = {
  /**
   * Track an event.
   */
  track(event: string, properties?: Record<string, unknown>): void {
    getPostHog()?.capture(event, properties);
  },

  /**
   * Identify a user.
   */
  identify(userId: string, traits?: Record<string, unknown>): void {
    getPostHog()?.identify(userId, traits);
  },

  /**
   * Reset the current user (on sign-out).
   */
  reset(): void {
    getPostHog()?.reset();
  },

  /**
   * Track a page view.
   */
  page(path: string): void {
    getPostHog()?.capture("$pageview", { $current_url: path });
  },
};
