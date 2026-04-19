#!/usr/bin/env node
/**
 * Weekly autopilot prospecting cron for RegsGuard.
 *
 * What it does, every Monday at 6am CT:
 *   1. Loads a queue of MN/WI trade-contractor prospects from
 *      `prospects-queue.json` in the project root
 *   2. Dedupes against everyone we've already contacted (stored in
 *      `outreach-sent.json` — persistent across runs)
 *   3. Dedupes against bounces + unsubscribes (`outreach-unsubscribes.json`)
 *   4. Picks the first N unsent prospects (default 10; MAX_WEEKLY=15)
 *   5. Sends each a personalized intro email via Resend from
 *      brendan@rebooked.org, 20s apart (gentle pacing)
 *   6. Appends sent entries to `outreach-sent.json` with timestamp + messageId
 *   7. Appends any send failures to `outreach-failures.json` for review
 *
 * How to add prospects to the queue:
 *   - Append objects to `prospects-queue.json` with shape:
 *     { "email": "...", "firstName": "...", "company": "...",
 *       "trade": "plumbing|electrical|HVAC|mechanical|residential",
 *       "city": "Minneapolis, MN" }
 *   - Sources: Lusha exports, St. Paul/Milwaukee city license PDFs,
 *     MN DLI license downloads, WI DSPS license search
 *
 * How unsubscribes work:
 *   - If someone replies "unsubscribe" / "remove me" / "stop" to your
 *     brendan@rebooked.org inbox, add their email to the
 *     `outreach-unsubscribes.json` array (manual for now — inbox-parse
 *     automation is a separate phase)
 *   - Their email will never be emailed again by this cron
 *
 * Scheduled via crontab on the VPS:
 *   0 6 * * 1 cd /opt/regsguard && /usr/bin/node scripts/weekly-prospecting-cron.mjs >> /root/regsguard-cron.log 2>&1
 *
 * Manual run (for testing):
 *   node scripts/weekly-prospecting-cron.mjs           # sends
 *   node scripts/weekly-prospecting-cron.mjs --dry-run # preview only
 */
import { Resend } from "resend";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

const DRY_RUN = process.argv.includes("--dry-run");
const MAX_WEEKLY = parseInt(process.env.PROSPECTING_MAX_WEEKLY || "10", 10);

const ROOT = process.cwd();
const QUEUE_PATH = path.join(ROOT, "prospects-queue.json");
const SENT_PATH = path.join(ROOT, "outreach-sent.json");
const FAILURES_PATH = path.join(ROOT, "outreach-failures.json");
const UNSUBSCRIBES_PATH = path.join(ROOT, "outreach-unsubscribes.json");

const FROM = "Brendan Jacobs <brendan@rebooked.org>";
const REPLY_TO = "brendan@rebooked.org";
const POSTAL = "RegsGuard · Minneapolis, MN";

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error(`[cron] Could not parse ${filePath}:`, err);
    return [];
  }
}

function appendJsonArray(filePath, entries) {
  const existing = readJsonArray(filePath);
  existing.push(...entries);
  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function subjectFor(p) {
  return `${p.firstName}, a question about license renewals at ${p.company}`;
}

function htmlBodyFor(p) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a2e;line-height:1.6">
<div style="max-width:580px;margin:0 auto;padding:32px 20px">
  <p style="margin:0 0 16px">Hi ${p.firstName},</p>
  <p style="margin:0 0 16px">Quick question &mdash; how much office time does ${p.company} burn every month on ${p.city.includes("WI") ? "WI DSPS" : "MN DLI"} renewals, CE hours, contractor bonds, and city license paperwork?</p>
  <p style="margin:0 0 16px">I'm Brendan &mdash; I'm building <strong>RegsGuard</strong> because I was tired of watching contractor shops in the Twin Cities and Milwaukee get dinged with late fees over stuff that should've been handled weeks earlier.</p>
  <p style="margin:0 0 8px"><strong>What it does for ${p.trade} shops:</strong></p>
  <ul style="margin:0 0 20px;padding-left:20px">
    <li style="margin-bottom:6px">Tracks every deadline &mdash; licenses, CE, bonds, insurance, EPA 608, city registrations</li>
    <li style="margin-bottom:6px">Auto-generates the renewal PDF from your company profile (set it once)</li>
    <li style="margin-bottom:6px">Emails it to the right authority 7 days before it's due, with a timestamped audit trail</li>
    <li style="margin-bottom:6px">27+ document templates &mdash; all auto-filled from your profile and linked jobs</li>
  </ul>
  <p style="margin:0 0 16px"><strong>First 100 shops get $19/mo for life</strong> &mdash; 14-day free trial, card required but no charge during trial.</p>
  <p style="margin:0 0 16px">Worth 5 min next week? Reply with a time or hit my cell below.</p>
  <p style="margin:0 0 4px">Brendan Jacobs</p>
  <p style="margin:0 0 4px;color:#6b7280;font-size:14px">Founder, RegsGuard</p>
  <p style="margin:0 0 4px;font-size:14px"><a href="mailto:brendan@rebooked.org" style="color:#2563eb;text-decoration:none">brendan@rebooked.org</a> &middot; <a href="tel:+16124397445" style="color:#2563eb;text-decoration:none">(612) 439-7445</a></p>
  <p style="margin:0 0 24px;font-size:14px"><a href="https://regsguard.rebooked.org" style="color:#2563eb;text-decoration:none">regsguard.rebooked.org</a></p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
  <p style="color:#9ca3af;font-size:11px;line-height:1.5;margin:0">
    You're receiving this because ${p.company} is listed as an active ${p.trade} contractor in ${p.city}. Reply "unsubscribe" and I'll take you off permanently.<br/><br/>${POSTAL}
  </p>
</div></body></html>`;
}

function textBodyFor(p) {
  return `Hi ${p.firstName},

Quick question -- how much office time does ${p.company} burn every month on ${p.city.includes("WI") ? "WI DSPS" : "MN DLI"} renewals, CE hours, contractor bonds, and city license paperwork?

I'm Brendan -- I'm building RegsGuard because I was tired of watching contractor shops in the Twin Cities and Milwaukee get dinged with late fees.

What it does for ${p.trade} shops:
- Tracks every deadline (licenses, CE, bonds, insurance, EPA 608, city registrations)
- Auto-generates the renewal PDF from your company profile
- Emails it to the right authority 7 days before it's due
- 27+ document templates auto-filled from your profile and linked jobs

First 100 shops get $19/mo for life. 14-day free trial, card required but no charge during trial.

Worth 5 min next week?

Brendan Jacobs
Founder, RegsGuard
brendan@rebooked.org · (612) 439-7445
https://regsguard.rebooked.org

---

You're receiving this because ${p.company} is listed as an active ${p.trade} contractor in ${p.city}. Reply "unsubscribe" and I'll take you off permanently.

${POSTAL}`;
}

async function main() {
  console.log(`[cron] ${new Date().toISOString()} weekly-prospecting ${DRY_RUN ? "DRY RUN" : "LIVE"}`);

  const queue = readJsonArray(QUEUE_PATH);
  const sent = readJsonArray(SENT_PATH);
  const unsubs = new Set(readJsonArray(UNSUBSCRIBES_PATH).map((e) => (typeof e === "string" ? e : e.email).toLowerCase()));
  const sentEmails = new Set(sent.map((e) => e.email.toLowerCase()));

  console.log(`[cron] Queue: ${queue.length}, already sent: ${sent.length}, unsubscribed: ${unsubs.size}`);

  // Filter to unsent, non-unsubscribed
  const candidates = queue.filter((p) => {
    const email = p.email?.toLowerCase();
    if (!email) return false;
    if (sentEmails.has(email)) return false;
    if (unsubs.has(email)) return false;
    return true;
  });

  const batch = candidates.slice(0, MAX_WEEKLY);
  console.log(`[cron] ${candidates.length} fresh candidates, sending ${batch.length} this run`);

  if (batch.length === 0) {
    console.log("[cron] Nothing to send this week. Queue is empty or exhausted.");
    return;
  }

  if (DRY_RUN) {
    console.log("[cron] Dry-run preview:");
    for (const p of batch) {
      console.log(`  ${p.firstName} @ ${p.company} <${p.email}> (${p.city})`);
      console.log(`    Subject: ${subjectFor(p)}`);
    }
    return;
  }

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    console.error("[cron] Missing RESEND_API_KEY in .env");
    process.exit(1);
  }
  const resend = new Resend(RESEND_KEY);

  const successes = [];
  const failures = [];

  for (let i = 0; i < batch.length; i++) {
    const p = batch[i];
    console.log(`[${i + 1}/${batch.length}] ${p.firstName} @ ${p.company} <${p.email}>`);
    try {
      const { data, error } = await resend.emails.send({
        from: FROM,
        to: p.email,
        replyTo: REPLY_TO,
        subject: subjectFor(p),
        html: htmlBodyFor(p),
        text: textBodyFor(p),
        tags: [
          { name: "campaign", value: "weekly-prospecting" },
          { name: "category", value: "cold-outreach" },
        ],
      });
      if (error) {
        console.log(`   ✗ ${error.message}`);
        failures.push({
          ts: new Date().toISOString(),
          email: p.email,
          company: p.company,
          error: String(error.message || error),
        });
      } else {
        console.log(`   ✓ sent · ${data?.id}`);
        successes.push({
          ts: new Date().toISOString(),
          email: p.email,
          company: p.company,
          firstName: p.firstName,
          messageId: data?.id,
        });
      }
    } catch (err) {
      console.log(`   ✗ threw: ${err instanceof Error ? err.message : err}`);
      failures.push({
        ts: new Date().toISOString(),
        email: p.email,
        company: p.company,
        error: err instanceof Error ? err.message : String(err),
      });
    }

    // 20s pacing between sends -- easier on Resend + looks less spammy
    if (i < batch.length - 1) await sleep(20000);
  }

  if (successes.length > 0) appendJsonArray(SENT_PATH, successes);
  if (failures.length > 0) appendJsonArray(FAILURES_PATH, failures);

  console.log(`[cron] Done. Sent ${successes.length}, failed ${failures.length}`);
}

main().catch((err) => {
  console.error("[cron] fatal:", err);
  process.exit(1);
});
