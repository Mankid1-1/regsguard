/**
 * Lightweight feature flag system.
 *
 * Reads flags from FEATURE_FLAGS env var (JSON object):
 *   FEATURE_FLAGS='{"webhook-retries":true,"sse-notifications":0.5}'
 *
 * Flag values:
 *   true/false  — enabled/disabled for everyone
 *   number 0-1  — percentage rollout (based on userId hash)
 */

let flags: Record<string, boolean | number> | null = null;

function loadFlags(): Record<string, boolean | number> {
  if (flags !== null) return flags;
  try {
    flags = JSON.parse(process.env.FEATURE_FLAGS || "{}");
  } catch {
    flags = {};
  }
  return flags!;
}

/**
 * Simple string hash for deterministic percentage rollout.
 */
function hashPercent(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash % 100) / 100;
}

/**
 * Check if a feature flag is enabled.
 *
 * @param flag    Feature flag name
 * @param userId  Optional user ID for percentage rollouts
 */
export function isEnabled(flag: string, userId?: string): boolean {
  const value = loadFlags()[flag];

  if (value === undefined || value === false) return false;
  if (value === true) return true;

  // Percentage rollout
  if (typeof value === "number" && userId) {
    return hashPercent(`${flag}:${userId}`) < value;
  }

  return false;
}

/**
 * Reload flags from environment (useful after config change).
 */
export function reloadFlags(): void {
  flags = null;
}
