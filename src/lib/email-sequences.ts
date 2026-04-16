/**
 * Email sequences for contractors (real language, real actions)
 * Triggered on specific user milestones
 */

export const EMAIL_SEQUENCES = {
  // Day 0: Welcome with immediate value
  WELCOME: {
    subject: "Your compliance autopilot is ready 🚀",
    template: "welcome",
    delay: 0,
    content: `
Hey {{firstName}}! 

Welcome to RegsGuard. You're one of the first {{contractors_count}} contractors using this.

Here's what happens next:
1️⃣ Your next deadline: {{next_deadline}} ({{days_until}} days)
2️⃣ One click to generate the form
3️⃣ One click to email it to the authority

No more $500+ late fees. That's the whole thing.

→ {{cta_link}}
    `.trim(),
  },

  // Day 2: Social proof (real contractors, real wins)
  SOCIAL_PROOF: {
    subject: "How {{referral_friend}} saved 3 hours this week",
    template: "social_proof",
    delay: 2,
    content: `
Hey {{firstName}},

A contractor in {{user_state}} just generated their {{regulation_title}} renewal in 60 seconds.

No forms to hunt down. No copying/pasting. Just:
→ Click "Generate"
→ Click "Send"
→ Done.

Their next deadline? Already on the calendar with alerts.

Try it yourself:
→ {{cta_link}}
    `.trim(),
  },

  // Day 7: Progress report (real data)
  WEEK_ONE: {
    subject: "You nailed compliance week one 🎯",
    template: "week_one",
    delay: 7,
    content: `
Hey {{firstName}},

Weekly report for {{user_name}}:

📌 Deadlines tracked: {{deadline_count}}
📄 Documents generated: {{document_count}}
⏰ Time saved: ~{{time_saved}} hours

You're on the path. Keep this up and you'll never pay a late fee again.

Next deadline: {{next_deadline}} ({{days_until}} days)
→ {{cta_link}}
    `.trim(),
  },

  // Day 14: Team CTA (growth hook)
  TEAM_INVITE: {
    subject: "Add your crew (and get a free month)",
    template: "team_invite",
    delay: 14,
    content: `
Hey {{firstName}},

You've been crushing it solo. Imagine if your whole crew was on this:

✓ Field workers see deadline alerts on their phones
✓ Bookkeeper gets automatic exports for taxes
✓ You get one dashboard to rule them all

Better part? Refer 3 contractors and get a month free.

→ Invite your crew: {{cta_link}}
    `.trim(),
  },

  // Day 30: Upsell (team/annual)
  ONE_MONTH: {
    subject: "What happens if you miss one deadline",
    template: "one_month",
    delay: 30,
    content: `
Hey {{firstName}},

You've been on RegsGuard for 30 days. Odds are:
- You haven't missed a deadline ✓
- You've saved 3-5 hours of paperwork ✓
- You're sleeping better 😴

One thing though: if one person on your crew forgets, it's on you.

Lock in team access + get annual savings:
→ {{cta_link}}

(And still refer 3 friends for a free month while you're at it.)
    `.trim(),
  },
};

export const TRIGGER_SEQUENCES = {
  DOCUMENT_GENERATED: {
    subject: "You just crushed {{deadline_name}} 🎉",
    delay: 5, // minutes
    content: `
{{firstName}}, you just generated and filed {{deadline_name}} in 90 seconds.

That's the point of RegsGuard.

Share your win? 
→ {{share_linkedin_url}}
→ {{share_facebook_url}}

Next deadline: {{next_deadline}}
    `.trim(),
  },

  REFERRAL_CONVERTED: {
    subject: "You referred {{referred_name}} — and unlocked 1 free month 🎁",
    delay: 0,
    content: `
{{firstName}},

{{referred_name}} just signed up using your code. That's 1 of 3 referrals needed for a free month.

2 more to go:
→ {{share_referral_link}}

You're building the compliance squad.
    `.trim(),
  },

  REFERRAL_BONUS_EARNED: {
    subject: "You earned 1 free month! 🎉",
    delay: 0,
    content: `
{{firstName}},

Congrats! You referred 3 contractors.

We're crediting 1 free month to your account. It starts next billing cycle.

Want to earn more? Refer 3 more.
→ {{share_referral_link}}
    `.trim(),
  },

  COMPLIANCE_STREAK: {
    subject: "You're {{streak_days}} days overdue-free 🔥",
    delay: 1440, // 1 day after milestone
    content: `
{{firstName}},

{{streak_days}} days without a missed deadline.

That's not luck. That's RegsGuard working.

Keep it going:
→ {{cta_dashboard}}
    `.trim(),
  },

  DEADLINE_ALERT: {
    subject: "{{days_until}} days until {{deadline_name}}",
    delay: 0,
    content: `
{{firstName}},

Your {{deadline_name}} is due in {{days_until}} days.

One click to generate the form. One click to file it.

→ {{cta_generate}}
    `.trim(),
  },
};

export function renderEmail(template: string, variables: Record<string, string | number>): string {
  let content = template;

  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`;
    content = content.replace(new RegExp(placeholder, "g"), String(value));
  });

  return content;
}
