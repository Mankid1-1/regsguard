/**
 * Input sanitization utilities.
 *
 * Strips dangerous HTML / script content from user-supplied text
 * to prevent stored XSS.  Designed to be used as Zod transforms
 * or called directly before persisting data.
 */

const SCRIPT_TAG = /<script[\s>][\s\S]*?<\/script>/gi;
const EVENT_HANDLER = /\s*on\w+\s*=\s*["'][^"']*["']/gi;
const HTML_TAGS = /<\/?[^>]+(>|$)/g;
const JS_URI = /javascript\s*:/gi;
const DATA_URI = /data\s*:\s*text\/html/gi;
const EXPRESSION_CSS = /expression\s*\(/gi;

/**
 * Sanitize a single text string by stripping HTML tags, script blocks,
 * event handlers, and dangerous URI schemes.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(SCRIPT_TAG, "")
    .replace(EVENT_HANDLER, "")
    .replace(HTML_TAGS, "")
    .replace(JS_URI, "")
    .replace(DATA_URI, "")
    .replace(EXPRESSION_CSS, "")
    .trim();
}

/**
 * Deep-sanitize all string values in a plain object or array.
 */
export function sanitizeObject<T>(obj: T): T {
  if (typeof obj === "string") return sanitizeText(obj) as T;
  if (Array.isArray(obj)) return obj.map(sanitizeObject) as T;
  if (obj !== null && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeObject(v);
    }
    return out as T;
  }
  return obj;
}

/**
 * Zod-compatible transform that can be chained:
 *   z.string().transform(sanitize)
 */
export const sanitize = sanitizeText;
