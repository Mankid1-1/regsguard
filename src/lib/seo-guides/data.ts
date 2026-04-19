/**
 * Data layer driving programmatic SEO pages at /guides/[slug].
 *
 * Each entry becomes a dedicated landing page optimized for a long-tail
 * search query that a MN/WI trade contractor is likely to type into
 * Google. Built from actual regulation data — every page answers a
 * specific, verifiable question with real authorities, fees, and due
 * dates.
 *
 * Rank-ability depends on four things: (1) unique title + H1, (2) a
 * direct answer in the first 100 words, (3) unique body content (no
 * template boilerplate — each page pulls distinct facts from the
 * `data` block), (4) internal linking between related guides.
 *
 * To add a new guide, append to GUIDES. No code changes needed;
 * the dynamic route and sitemap pick it up automatically.
 */

export interface SeoGuide {
  slug: string;
  /** Page <title> and main headline */
  title: string;
  /** Meta description (155-160 chars) */
  description: string;
  /** Search query this page targets */
  targetQuery: string;
  /** One of: license, ce, bond, insurance, epa, city, document, permit */
  category: "license" | "ce" | "bond" | "insurance" | "epa" | "city" | "document" | "permit";
  /** Key facts shown in a quick-glance box above the fold */
  quickFacts: { label: string; value: string }[];
  /** First-paragraph direct answer (plain text, 1-2 sentences) */
  leadAnswer: string;
  /** Body sections */
  sections: { heading: string; body: string }[];
  /** CTA button copy customized per page */
  cta: { heading: string; button: string };
  /** Related guide slugs for internal linking */
  related: string[];
  /** FAQ for JSON-LD FAQPage schema (boosts SERP appearance) */
  faqs: { q: string; a: string }[];
  /** OG tag hints */
  og?: { type?: string; keywords?: string[] };
}

export const GUIDES: SeoGuide[] = [
  // ─── MN License Renewal Guides ────────────────────────────────
  {
    slug: "mn-plumbing-license-renewal",
    title: "Minnesota Plumbing License Renewal 2026: Cost, CE Hours, Deadline",
    description:
      "Renew your MN plumber license: $50 fee, 16 CE hours annually, filed through MN DLI. Deadline, forms, and auto-file option explained.",
    targetQuery: "mn plumbing license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "MN Department of Labor and Industry (DLI)" },
      { label: "Fee", value: "$50" },
      { label: "Cycle", value: "Annual" },
      { label: "CE Required", value: "16 hours/year, DLI-approved providers" },
      { label: "Deadline", value: "License anniversary date" },
      { label: "Portal", value: "dli.mn.gov/business/plumbing-and-mechanical-contractors" },
    ],
    leadAnswer:
      "Minnesota plumbers renew annually with MN DLI for a $50 fee and must complete 16 continuing education hours from an approved provider before the renewal date. Master, journeyworker, and restricted licenses all use the same process.",
    sections: [
      {
        heading: "Who needs to renew",
        body: "Every MN plumber — master, journeyworker, or restricted — must renew each year on the anniversary of their original license issue date. The bond requirement ($25,000 surety bond) runs on the same annual cycle and is typically renewed at the same time. Plumbing contractors with multiple licensed employees need to track each employee's renewal individually.",
      },
      {
        heading: "Continuing education requirement",
        body: "16 CE hours must be completed during the 12 months before the renewal date. Courses must be from a DLI-approved provider. Keep certificates of completion for at least 4 years — DLI can audit you up to that point. CE can be completed online or in person. MN DLI publishes a current list of approved CE providers on dli.mn.gov.",
      },
      {
        heading: "Renewal steps",
        body: "1. Log into the DLI eLicense portal and confirm your personal info, mailing address, and business address are current. 2. Upload CE certificates. 3. Confirm your $25,000 bond is active and on file (renew separately through your surety company). 4. Pay the $50 fee by credit card. 5. Save the confirmation email as proof of renewal. Late renewal (past your anniversary) adds fees and can cause a lapse that requires re-application.",
      },
      {
        heading: "Common mistakes",
        body: "Forgetting the bond renewal — DLI will reject your license renewal if your surety bond has lapsed. Missing CE deadline — CE must be completed BEFORE submitting the renewal, not after. Using a non-approved provider — if your CE provider isn't on the DLI approved list, those hours don't count.",
      },
    ],
    cta: {
      heading: "Never miss a MN plumbing renewal again",
      button: "Track my license on autopilot",
    },
    related: [
      "mn-plumbing-ce-requirements",
      "mn-plumbing-bond-25000",
      "mn-master-electrician-license-renewal",
    ],
    faqs: [
      {
        q: "How much does a MN plumbing license renewal cost in 2026?",
        a: "$50 for the license renewal itself, plus the annual bond premium (typically $100-500 depending on credit and claims history) and the cost of 16 CE hours ($200-600 depending on provider).",
      },
      {
        q: "How many CE hours does a MN plumber need?",
        a: "16 hours per year from a DLI-approved provider.",
      },
      {
        q: "What happens if I miss my MN plumber renewal date?",
        a: "Your license lapses. Late renewals are accepted up to 12 months after expiration with additional fees. After 12 months, you must re-apply from scratch and may need to re-sit the licensing exam.",
      },
    ],
  },

  {
    slug: "mn-master-electrician-license-renewal",
    title: "MN Master Electrician License Renewal 2026: $60 Fee, 24 CE Hours",
    description:
      "Renew your Minnesota master electrician license every 2 years. $60 fee, 24 CE hours including NEC updates. Filed through MN Board of Electricity.",
    targetQuery: "mn master electrician license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "MN Board of Electricity" },
      { label: "Fee", value: "$60" },
      { label: "Cycle", value: "Biennial (every 2 years)" },
      { label: "CE Required", value: "24 hours, incl. 2 hrs NEC updates" },
      { label: "Deadline", value: "Last day of birth month (even/odd year by license)" },
    ],
    leadAnswer:
      "MN master electricians renew every two years through the MN Board of Electricity for a $60 fee. 24 continuing education hours are required per renewal period, including at least 2 hours on National Electrical Code updates.",
    sections: [
      {
        heading: "Renewal cycle",
        body: "MN electrician licenses renew biennially (every two years). Your renewal year is determined by your license number — even-numbered licenses renew in even years, odd in odd years. The deadline is the last day of your birth month. The Board typically emails you ~60 days before the deadline.",
      },
      {
        heading: "Continuing education requirement",
        body: "24 CE hours every 2 years. A minimum of 2 hours MUST be on National Electrical Code updates — this is the most commonly missed requirement. The rest can be any approved electrical topic. Approved providers are listed on the MN Board of Electricity website.",
      },
      {
        heading: "Journeyworker vs master",
        body: "Journeyworker electricians have a lower CE requirement (16 hours per 2-year period). The $40 fee applies to journeyworker. Master electricians can supervise installations and pull permits; journeyworkers cannot. Registered (unlicensed) electricians renew annually for $20 with no CE requirement.",
      },
      {
        heading: "Online renewal",
        body: "Renewal is handled through the DLI eLicense portal (the Board of Electricity was merged into DLI). Upload your CE certificates, confirm personal info, pay online. Keep certificates for 4+ years for potential audit.",
      },
    ],
    cta: {
      heading: "Auto-track your MN electrical license + NEC CE",
      button: "Start free trial",
    },
    related: ["mn-electrical-ce-nec-requirements", "mn-journeyworker-electrician-license", "mn-registered-electrician-renewal"],
    faqs: [
      { q: "How much is a MN master electrician renewal?", a: "$60 for 2 years." },
      { q: "How many CE hours does a MN master electrician need?", a: "24 hours per 2-year renewal period, including at least 2 hours on NEC updates." },
      { q: "When does my MN electrician license renew?", a: "The last day of your birth month in the year matching your license number (even/odd)." },
    ],
  },

  {
    slug: "mn-journeyworker-electrician-license",
    title: "MN Journeyworker Electrician License Renewal: $40, 16 CE Hours",
    description: "Renew your MN journeyworker electrician license every 2 years for $40. 16 CE hours required including NEC code updates.",
    targetQuery: "mn journeyworker electrician license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "MN Board of Electricity (via DLI)" },
      { label: "Fee", value: "$40" },
      { label: "Cycle", value: "Biennial" },
      { label: "CE Required", value: "16 hours" },
      { label: "Supervision", value: "Must work under a master electrician" },
    ],
    leadAnswer:
      "Minnesota journeyworker electricians renew biennially for $40 and must complete 16 CE hours including NEC code updates. Journeyworkers work under master electrician supervision and cannot pull permits independently.",
    sections: [
      { heading: "Scope of work", body: "Journeyworker electricians may perform electrical installations under the direct supervision of a master electrician. They cannot pull their own permits or supervise others. Many journeyworkers pursue the master license after 5+ years of experience." },
      { heading: "CE requirement", body: "16 hours of approved continuing education per 2-year renewal period. Must include NEC code update hours. Online and in-person options both count — DLI maintains the approved provider list." },
      { heading: "Renewal alignment", body: "Renewal date follows the same rule as master electricians (last day of birth month in even/odd year matching license number). If you're planning to upgrade to master within the renewal cycle, you still complete the journeyworker CE requirement." },
    ],
    cta: { heading: "Stay on top of your journeyworker renewals", button: "Track deadlines free" },
    related: ["mn-master-electrician-license-renewal", "mn-electrical-ce-nec-requirements", "mn-registered-electrician-renewal"],
    faqs: [
      { q: "How much is a MN journeyworker electrician license renewal?", a: "$40 every 2 years." },
      { q: "Can MN journeyworker electricians pull permits?", a: "No. Only master electricians can pull electrical permits in Minnesota." },
    ],
  },

  {
    slug: "mn-registered-electrician-renewal",
    title: "MN Registered Electrician Annual Renewal: $20, No CE Required",
    description: "MN registered (unlicensed) electricians renew annually for $20. No CE required but must work under licensed supervision at all times.",
    targetQuery: "mn registered electrician renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "MN Board of Electricity (via DLI)" },
      { label: "Fee", value: "$20" },
      { label: "Cycle", value: "Annual" },
      { label: "CE Required", value: "None" },
      { label: "Supervision", value: "Direct supervision by master or journeyworker required" },
    ],
    leadAnswer: "Registered (unlicensed) electricians in Minnesota renew annually for $20. No continuing education is required, but they must work under direct supervision of a licensed electrician at all times.",
    sections: [
      { heading: "What is a registered electrician?", body: "Minnesota requires anyone performing electrical work — even apprentices and helpers — to be registered or licensed. 'Registered' covers unlicensed workers who are learning the trade or working as helpers. There's no exam; you submit basic information and pay $20." },
      { heading: "Supervision rules", body: "Registered electricians must work under the direct, on-site supervision of a master or journeyworker electrician. They cannot work alone, cannot pull permits, and cannot sign off on inspections." },
      { heading: "Path to licensed", body: "Most registered electricians pursue the journeyworker license after 4 years (8,000 hours) of documented electrical work under supervision. Keep your registration active the whole time — a lapse resets your work-hour accrual." },
    ],
    cta: { heading: "Track your registration + supervisor hours", button: "Get reminders" },
    related: ["mn-journeyworker-electrician-license", "mn-master-electrician-license-renewal"],
    faqs: [
      { q: "Do MN registered electricians need CE hours?", a: "No. CE is only required for journeyworker and master licenses." },
      { q: "How long to become a MN journeyworker?", a: "4 years (8,000 hours) of documented electrical work under a licensed electrician, then pass the exam." },
    ],
  },

  {
    slug: "mn-hvac-mechanical-license-renewal",
    title: "Minnesota HVAC/Mechanical Contractor License Renewal 2026",
    description: "MN HVAC and mechanical contractor licenses renew annually through MN DLI for $50. Covers heating, AC, refrigeration, and process piping work.",
    targetQuery: "mn hvac mechanical license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "MN DLI" },
      { label: "Fee", value: "$50" },
      { label: "Cycle", value: "Annual" },
      { label: "Scope", value: "HVAC, refrigeration, process piping, hydronic heating" },
    ],
    leadAnswer: "Minnesota HVAC and mechanical contractor licenses renew annually through MN DLI for $50. The license covers heating, ventilation, air conditioning, refrigeration, and related mechanical work.",
    sections: [
      { heading: "Who it covers", body: "Individuals and businesses performing HVAC or mechanical contractor work in Minnesota. This includes warm air heating, combustion systems, process piping, and hydronic heating systems. Separate licenses exist for specialty work like boilers and sheet metal." },
      { heading: "CE requirements", body: "CE may be required depending on your specific license class. Check DLI's current CE rules for your license type — requirements have increased for some classes in recent years." },
      { heading: "Related licenses", body: "Many HVAC contractors also hold the EPA Section 608 certification (required for handling refrigerants), a MN boiler operator license (for certain boiler work), and a sheet metal worker license. Renewal dates for all four often fall in different months — easy to miss if you're tracking manually." },
    ],
    cta: { heading: "Track your HVAC license + EPA 608 + boiler + sheet metal", button: "See all my deadlines" },
    related: ["epa-608-certification-renewal", "mn-boiler-operator-license", "mn-sheet-metal-worker-license"],
    faqs: [
      { q: "How much is a MN HVAC license renewal?", a: "$50 annually." },
      { q: "Do MN HVAC contractors need EPA 608?", a: "Yes, if they handle refrigerants — which virtually all HVAC work involves." },
    ],
  },

  // ─── WI License Renewal Guides ────────────────────────────────
  {
    slug: "wi-master-plumber-license-renewal",
    title: "Wisconsin Master Plumber License Renewal: $56, Due June 30 Even Years",
    description:
      "WI master plumber licenses renew every 2 years on June 30 of even-numbered years. $56 fee through WI DSPS eLicensing portal. CE required.",
    targetQuery: "wisconsin master plumber license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "WI Department of Safety and Professional Services (DSPS)" },
      { label: "Fee", value: "$56" },
      { label: "Cycle", value: "Biennial" },
      { label: "Deadline", value: "June 30 of even years" },
      { label: "CE Required", value: "12 hours per 2-year cycle" },
    ],
    leadAnswer:
      "Wisconsin master plumber licenses renew every two years on June 30 of even-numbered years. The fee is $56 through the DSPS eLicensing portal, and 12 continuing education hours are required per renewal cycle.",
    sections: [
      {
        heading: "Why the fixed June 30 deadline matters",
        body: "Unlike Minnesota's anniversary-date renewal, Wisconsin has a single, fixed deadline: June 30 of even years (2026, 2028, 2030...). Every WI plumber in the state renews on the same date. This creates massive DSPS traffic in June — the portal can be slow or unresponsive in the final week. Renew in May to avoid this.",
      },
      {
        heading: "CE requirements",
        body: "12 hours of approved CE over the 2-year period. DSPS maintains a list of approved providers. Keep certificates of completion — DSPS audits a random percentage of renewals each cycle and requires proof within 30 days.",
      },
      {
        heading: "Journeyman vs master",
        body: "Master plumbers ($56) can design, install, and supervise. Journeyman plumbers ($56, same fee) install and repair under master supervision. Both have the same June 30 even-year renewal. Cross-connection control testers have a separate biennial credential ($100).",
      },
    ],
    cta: {
      heading: "Never miss the June 30 WI renewal deadline",
      button: "Auto-file my WI plumber renewal",
    },
    related: ["wi-journeyman-plumber-license", "wi-plumbing-ce-requirements", "wi-cross-connection-control-tester"],
    faqs: [
      { q: "When does a WI master plumber license renew?", a: "June 30 of even-numbered years. Every 2 years." },
      { q: "How much is a WI plumber renewal?", a: "$56 for both master and journeyman." },
      { q: "How many CE hours for WI plumbers?", a: "12 hours every 2 years from a DSPS-approved provider." },
    ],
  },

  {
    slug: "wi-journeyman-plumber-license",
    title: "Wisconsin Journeyman Plumber License Renewal: $56 Biennial",
    description: "WI journeyman plumber license renewal: $56 every 2 years, due June 30 even years. Must work under master plumber supervision.",
    targetQuery: "wisconsin journeyman plumber license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "WI DSPS" },
      { label: "Fee", value: "$56" },
      { label: "Cycle", value: "Biennial, June 30 even years" },
      { label: "Supervision", value: "Under a WI master plumber" },
    ],
    leadAnswer: "Wisconsin journeyman plumbers renew every 2 years for $56 through DSPS. Renewal is due June 30 of even-numbered years, same as master plumbers.",
    sections: [
      { heading: "Scope of work", body: "WI journeyman plumbers can install and repair plumbing systems under the direction of a master plumber. They cannot operate as a contractor independently without upgrading to master." },
      { heading: "CE required", body: "Same 12 hours over 2 years as master plumbers. Approved providers listed on dsps.wi.gov." },
      { heading: "Upgrade to master", body: "Requires 2 years of documented journeyman work plus passing the master plumber exam. Many WI journeymen upgrade within 2-4 years of first licensure." },
    ],
    cta: { heading: "Track your WI journeyman renewals automatically", button: "Free trial" },
    related: ["wi-master-plumber-license-renewal", "wi-plumbing-ce-requirements"],
    faqs: [
      { q: "When does my WI journeyman plumber license renew?", a: "June 30 of even years, same as master plumbers." },
      { q: "Can WI journeyman plumbers work alone?", a: "No — they must work under the supervision of a licensed master plumber." },
    ],
  },

  {
    slug: "wi-master-electrician-license-renewal",
    title: "Wisconsin Master Electrician License Renewal: $56 Biennial",
    description: "Renew your WI master electrician license every 2 years for $56 through DSPS. CE required. Due June 30 of even-numbered years.",
    targetQuery: "wisconsin master electrician license renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "WI DSPS" },
      { label: "Fee", value: "$56" },
      { label: "Cycle", value: "Biennial" },
      { label: "Deadline", value: "June 30 of even years" },
    ],
    leadAnswer: "Wisconsin master electrician licenses renew every 2 years for $56 through the DSPS eLicensing portal. Deadline is June 30 of even-numbered years.",
    sections: [
      { heading: "Renewal alignment", body: "WI has unified renewal dates across trades — master electricians, journeyman electricians, master plumbers, journeyman plumbers, and HVAC qualifiers all renew June 30 of even years. If you hold multiple credentials, you can handle them all in a single DSPS session." },
      { heading: "CE requirements", body: "Continuing education required — hours vary by license type. Check DSPS for your specific credential. NEC code update hours are often mandated separately." },
      { heading: "Permits and inspections", body: "Master electricians can pull permits and supervise work. Only master-licensed workers can sign off on electrical inspections in Wisconsin." },
    ],
    cta: { heading: "Auto-file all your WI electrical renewals", button: "Start free trial" },
    related: ["wi-journeyman-electrician-license-renewal", "wi-electrical-ce-requirements", "wi-master-plumber-license-renewal"],
    faqs: [
      { q: "How much is WI master electrician renewal?", a: "$56 every 2 years." },
      { q: "Can WI master electricians pull permits?", a: "Yes. Journeyman electricians cannot." },
    ],
  },

  {
    slug: "wi-hvac-qualifier-credential",
    title: "Wisconsin HVAC Qualifier Credential Renewal: $56 Biennial",
    description: "WI HVAC qualifier credential renews biennially for $56 through DSPS. Required for anyone qualifying an HVAC contractor registration.",
    targetQuery: "wisconsin hvac qualifier credential renewal",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "WI DSPS" },
      { label: "Fee", value: "$56" },
      { label: "Cycle", value: "Biennial, June 30 even years" },
      { label: "Scope", value: "HVAC, refrigeration, ventilation" },
    ],
    leadAnswer: "The Wisconsin HVAC qualifier credential renews every 2 years for $56 through DSPS. It's required for individuals who qualify an HVAC contractor registration in Wisconsin.",
    sections: [
      { heading: "Qualifier vs contractor", body: "In Wisconsin, an HVAC contractor registration (business-level) must be qualified by an individual holding the HVAC qualifier credential. The qualifier must be an officer or employee of the business. If your qualifier leaves, your registration is at risk." },
      { heading: "Related credentials", body: "Many HVAC contractors in WI also hold a sheet metal worker credential ($45) and Master electrician (for control work). EPA 608 is required for any refrigerant handling." },
    ],
    cta: { heading: "Keep your WI HVAC credential + registration synced", button: "Track everything" },
    related: ["wi-sheet-metal-worker-credential", "epa-608-certification-renewal", "wi-master-electrician-license-renewal"],
    faqs: [
      { q: "Is HVAC qualifier the same as HVAC contractor in WI?", a: "No. The qualifier is an individual credential; the contractor is a business registration the qualifier supports." },
    ],
  },

  // ─── CE Requirement Guides ────────────────────────────────────
  {
    slug: "mn-plumbing-ce-requirements",
    title: "MN Plumbing CE Requirements: 16 Hours/Year Approved Providers",
    description:
      "Minnesota plumbers need 16 CE hours per year from DLI-approved providers before license renewal. Keep certificates 4+ years for audits.",
    targetQuery: "mn plumbing ce hours required",
    category: "ce",
    quickFacts: [
      { label: "Requirement", value: "16 hours/year" },
      { label: "Authority", value: "MN DLI" },
      { label: "Approved Providers", value: "See dli.mn.gov approved list" },
      { label: "Record Retention", value: "4 years minimum" },
    ],
    leadAnswer: "Minnesota plumbers must complete 16 hours of approved continuing education every year before renewing their license. Courses must be from a MN DLI-approved provider.",
    sections: [
      { heading: "What counts", body: "CE topics must be relevant to the plumbing trade: current code updates, safety practices (e.g., confined space, asbestos awareness, lead-safe practices), technical training on new materials or methods. Business management courses generally do NOT count." },
      { heading: "Approved providers", body: "DLI maintains a live list of approved CE providers on dli.mn.gov. Large national providers (PHCC, ABC, Mechanical Contractors Association) are usually approved. Smaller or online-only providers may not be — always verify before enrolling." },
      { heading: "Online vs in-person", body: "Both count. Many plumbers prefer online for flexibility. Watch for proctored final exams on some online courses — those can take longer than the listed 'hours'." },
      { heading: "Audit risk", body: "DLI audits a random percentage of renewals each year. If audited, you must produce certificates within 30 days. Penalties for failing an audit include license suspension and re-exam requirements." },
    ],
    cta: { heading: "Log your CE hours + get renewal reminders", button: "Track my CE free" },
    related: ["mn-plumbing-license-renewal", "mn-plumbing-bond-25000"],
    faqs: [
      { q: "How many CE hours does a MN plumber need each year?", a: "16 hours per year from a MN DLI-approved provider." },
      { q: "Can I do MN plumbing CE online?", a: "Yes, as long as the provider is on the DLI approved list." },
      { q: "How long do I keep MN plumbing CE certificates?", a: "At least 4 years for potential DLI audit." },
    ],
  },

  {
    slug: "mn-electrical-ce-nec-requirements",
    title: "MN Electrician CE: 24 Hours/2 Years + NEC Code Update Hours",
    description:
      "MN master electricians need 24 CE hours per 2-year cycle. At least 2 must be NEC code updates. Journeyworkers need 16. Find approved providers.",
    targetQuery: "mn electrician ce hours nec required",
    category: "ce",
    quickFacts: [
      { label: "Master", value: "24 hours per 2-year cycle" },
      { label: "Journeyworker", value: "16 hours per 2-year cycle" },
      { label: "NEC Requirement", value: "Min. 2 hours on current NEC updates" },
      { label: "Registered", value: "None required" },
    ],
    leadAnswer: "Minnesota master electricians need 24 CE hours every 2 years — at least 2 hours must be on current National Electrical Code updates. Journeyworkers need 16 hours per 2-year cycle.",
    sections: [
      { heading: "The NEC requirement trips people up", body: "This is the single most commonly missed item on MN electrician renewals. Any CE provider can count general hours, but the NEC update hours must be on a course covering the current National Electrical Code cycle (the 2023 NEC at time of writing; updates every 3 years). Generic 'electrical safety' or 'OSHA' CE does NOT count as NEC hours." },
      { heading: "When the NEC updates", body: "NFPA publishes a new NEC every 3 years. Minnesota typically adopts the new code 6-18 months after NFPA publishes. When the new code is adopted, your NEC update CE must reflect the new code — old NEC hours no longer count for future renewals." },
      { heading: "Stacking with master-level upgrade", body: "If you're planning to upgrade from journeyworker to master during the renewal cycle, do the 24-hour master requirement — any excess from journeyworker requirements counts toward master." },
    ],
    cta: { heading: "Track your NEC hours + master renewal", button: "Auto-track CE" },
    related: ["mn-master-electrician-license-renewal", "mn-journeyworker-electrician-license"],
    faqs: [
      { q: "Do I need NEC updates for MN electrician renewal?", a: "Yes — at least 2 hours on current NEC code updates for master electricians." },
      { q: "How many CE hours for MN journeyworker electrician?", a: "16 hours per 2-year cycle." },
    ],
  },

  // ─── Bond / Insurance Guides ──────────────────────────────────
  {
    slug: "mn-plumbing-bond-25000",
    title: "MN Plumbing Bond Requirement: $25,000 Surety Bond Explained",
    description: "Every MN plumber needs a $25,000 surety bond on file with DLI. Annual premium $100-500. Covers public harm from faulty work.",
    targetQuery: "mn plumbing bond 25000",
    category: "bond",
    quickFacts: [
      { label: "Amount", value: "$25,000" },
      { label: "Type", value: "Surety bond" },
      { label: "Authority", value: "MN DLI" },
      { label: "Annual Premium", value: "$100-500 (varies by credit + claims)" },
    ],
    leadAnswer: "Minnesota master plumbers and plumbing contractors must maintain a $25,000 surety bond on file with DLI at all times. Annual premiums typically run $100-500 depending on your credit and claims history.",
    sections: [
      { heading: "What the bond actually does", body: "The bond protects the public against faulty or substandard plumbing work. If a homeowner sues a plumber for shoddy work, they can file a claim against the bond up to $25,000. The bond is NOT insurance — the plumber is still responsible for reimbursing the surety company after a claim payout." },
      { heading: "How to get one", body: "Any surety company can write a MN plumbing bond. Shop around — premiums vary significantly based on your personal credit and business claims history. A plumber with excellent credit might pay $100/year; one with bankruptcies or prior claims could pay $500+." },
      { heading: "Renewal timing", body: "Bond runs on an annual cycle separate from your license. If you let the bond lapse (even for a day), DLI will reject your license renewal or suspend your active license. Mark both renewals on the same calendar so they don't fall out of sync." },
    ],
    cta: { heading: "Track your bond + license together", button: "Sync both renewals" },
    related: ["mn-plumbing-license-renewal", "general-liability-insurance-contractors"],
    faqs: [
      { q: "How much is a MN plumbing bond?", a: "$25,000 coverage amount. Annual premium typically $100-500." },
      { q: "Is the MN plumbing bond insurance?", a: "No — it's a surety bond. You remain financially liable for any claim the surety pays out." },
    ],
  },

  {
    slug: "general-liability-insurance-contractors",
    title: "General Liability Insurance for Contractors: Minimums by State",
    description:
      "Most cities require $1M/$2M general liability insurance for contractor licenses. Certificate of insurance (ACORD 25) is the standard proof.",
    targetQuery: "general liability insurance contractors",
    category: "insurance",
    quickFacts: [
      { label: "Typical Minimum", value: "$1M per occurrence / $2M aggregate" },
      { label: "Proof", value: "ACORD 25 Certificate of Insurance" },
      { label: "Renewal", value: "Annual" },
    ],
    leadAnswer: "Commercial General Liability (CGL) insurance with $1M per occurrence / $2M aggregate is the industry-standard minimum for most contractor licenses, GC relationships, and city registrations. The proof document is an ACORD 25 Certificate of Insurance.",
    sections: [
      { heading: "What CGL covers", body: "Bodily injury (a customer gets hurt on your job site), property damage (you damage something you're not working on), and personal/advertising injury (defamation, copyright infringement in marketing). It does NOT cover: faulty work itself (that's professional liability or errors & omissions), auto accidents (commercial auto), or your own employees (workers comp)." },
      { heading: "When you need proof", body: "Every city contractor license application in MN and WI asks for proof of liability insurance. GCs request an ACORD 25 naming them as additional insured before you start work. Your customers may ask. Keep a current ACORD 25 in the same folder as your license." },
      { heading: "ACORD 25 form", body: "The ACORD 25 is the industry-standard Certificate of Liability Insurance form. It summarizes your coverage on a single page. Your insurance agent issues it on request, usually free. Many GCs require it to be 'current' — within 30 days — before your next project." },
    ],
    cta: { heading: "Generate an ACORD 25 in one click", button: "Try free" },
    related: ["acord-25-certificate-of-insurance", "mn-plumbing-bond-25000", "workers-comp-mn-wi-contractors"],
    faqs: [
      { q: "How much general liability insurance do I need as a contractor?", a: "Most jurisdictions require $1M/$2M. Some commercial GCs require $2M/$4M or higher. Check each contract." },
      { q: "Is ACORD 25 required?", a: "It's the industry-standard form. Most GCs and cities specifically ask for ACORD 25 or a 'certificate of insurance' which almost always means ACORD 25." },
    ],
  },

  {
    slug: "workers-comp-mn-wi-contractors",
    title: "Workers' Compensation for MN and WI Contractors (2026 Rules)",
    description:
      "MN requires workers comp for any contractor with employees. WI requires it for 3+ employees or any employee earning $500+/quarter. Penalties explained.",
    targetQuery: "workers compensation mn wi contractors",
    category: "insurance",
    quickFacts: [
      { label: "MN Threshold", value: "Any employee" },
      { label: "WI Threshold", value: "3+ employees OR $500+/quarter" },
      { label: "Penalty (MN)", value: "Up to $1,000/day + 65% of medical costs" },
      { label: "Penalty (WI)", value: "$100/day up to $10,000" },
    ],
    leadAnswer: "Minnesota requires workers' compensation coverage for any contractor with employees. Wisconsin requires it if you have 3+ employees or any employee earning $500+ in a calendar quarter. Both states penalize lapses aggressively.",
    sections: [
      { heading: "MN rules", body: "MN is strict: any employer with a single employee must carry workers' comp. Sole proprietors working alone are exempt but can elect coverage. Penalties for non-coverage include $1,000/day fines plus 65% of any medical costs incurred." },
      { heading: "WI rules", body: "WI's threshold is 3 employees OR paying any single employee more than $500 in a calendar quarter, whichever comes first. In construction specifically, sole proprietors are usually exempt but coverage is strongly recommended. Non-compliance: $100/day up to $10,000 cumulative." },
      { heading: "Proof of coverage", body: "Both states use a Certificate of Insurance (ACORD 25) as standard proof. Many cities require proof for contractor license renewals. Some GCs require it before you start any project." },
    ],
    cta: { heading: "Track workers comp + liability renewals together", button: "Sync insurance renewals" },
    related: ["general-liability-insurance-contractors", "acord-25-certificate-of-insurance"],
    faqs: [
      { q: "Do MN contractors need workers comp?", a: "Yes, if they have any employees." },
      { q: "When do WI contractors need workers comp?", a: "If they have 3+ employees or any employee earning $500+ per calendar quarter." },
    ],
  },

  // ─── EPA Certification Guides ─────────────────────────────────
  {
    slug: "epa-608-certification-renewal",
    title: "EPA Section 608 Certification: Lifetime Cert, A2L Supplement Required",
    description:
      "EPA 608 is lifetime — no renewal needed. But 2025 A2L refrigerant rules (R-32, R-454B) require supplemental training for technicians.",
    targetQuery: "epa 608 certification renewal",
    category: "epa",
    quickFacts: [
      { label: "Renewal", value: "None — lifetime certification" },
      { label: "New A2L Rule", value: "2025 supplemental training for R-32, R-454B" },
      { label: "Authority", value: "US EPA" },
      { label: "Cost", value: "$0 for the certification itself" },
    ],
    leadAnswer:
      "EPA Section 608 certification is a lifetime credential — no renewal required once you pass the exam. However, EPA's 2025 A2L refrigerant rules require supplemental training for technicians handling R-32, R-454B, and other mildly flammable refrigerants.",
    sections: [
      { heading: "The four certification types", body: "Type I (small appliances — window units, vending machines), Type II (high-pressure — most residential split systems), Type III (low-pressure — industrial chillers), Universal (all three). Most HVAC techs pursue Universal. The exam is 110 questions covering safety, refrigerant management, and EPA rules." },
      { heading: "A2L supplemental training (new, 2025)", body: "EPA finalized rules governing mildly flammable refrigerants (A2L class) in 2025. R-32 and R-454B are becoming standard in new equipment as R-410A is phased out. Technicians handling A2L refrigerants must complete supplemental safety training. Most equipment manufacturers (Carrier, Trane, Lennox) offer approved A2L courses. Keep certificates." },
      { heading: "What non-compliance costs", body: "EPA fines for improper refrigerant handling can reach $37,500 per day per violation. Customers, GCs, and your own insurance may require documentation that you're 608-certified before starting work. Keep your original 608 card scanned and accessible — it's proof you took the exam, but it has no expiration." },
    ],
    cta: {
      heading: "Track your EPA 608 + A2L training + state HVAC license",
      button: "All compliance in one place",
    },
    related: ["mn-hvac-mechanical-license-renewal", "wi-hvac-qualifier-credential", "epa-lead-rrp-firm-certification"],
    faqs: [
      { q: "Does EPA 608 certification expire?", a: "No — it's a lifetime certification. But A2L supplemental training is now required for new refrigerants." },
      { q: "What are A2L refrigerants?", a: "Mildly flammable refrigerants like R-32 and R-454B that are replacing R-410A in HVAC equipment. Require supplemental safety training per EPA 2025 rules." },
    ],
  },

  {
    slug: "epa-lead-rrp-firm-certification",
    title: "EPA Lead-Safe RRP Firm Certification: $550 Every 5 Years",
    description:
      "Firms doing renovation on pre-1978 housing need EPA RRP certification ($550, renewed every 5 years). Fines up to $37,500/day per violation.",
    targetQuery: "epa lead rrp firm certification",
    category: "epa",
    quickFacts: [
      { label: "Fee", value: "$550" },
      { label: "Cycle", value: "5 years" },
      { label: "Authority", value: "US EPA" },
      { label: "Scope", value: "Firms renovating pre-1978 housing + child-occupied facilities" },
    ],
    leadAnswer: "The EPA Renovation, Repair, and Painting (RRP) firm certification costs $550 and renews every 5 years. It's required for any firm performing renovation that disturbs lead-based paint in pre-1978 housing or child-occupied facilities.",
    sections: [
      { heading: "Individual vs firm certification", body: "EPA RRP has two layers: (1) Firm certification (company-level, $550, 5 years) — required for ANY work on pre-1978 housing. (2) Renovator individual certification ($300, 5 years) — required for at least one person on each job site. If your firm has 10 employees on a pre-1978 job, only one needs individual RRP; the rest can assist under direction." },
      { heading: "Common triggers", body: "Any project on a home built before 1978 that disturbs painted surfaces: window replacements, door jamb work, exterior sanding, interior demo. Even small projects (replacing a few square feet of trim) can trigger RRP rules." },
      { heading: "State-level layer (MN)", body: "Minnesota requires a separate MDH Lead-Safe Firm license on top of EPA RRP. Same work triggers both. MN license is $100/year, MDH has its own list of approved trainers." },
      { heading: "Penalties", body: "EPA fines reach $37,500 per day per violation. State fines stack on top. A single un-certified project on a pre-1978 home can cost more than all your legitimate RRP work combined." },
    ],
    cta: { heading: "Never let your RRP lapse — auto-track 5-year cycle", button: "Set up free" },
    related: ["mn-lead-safe-firm-license", "epa-608-certification-renewal"],
    faqs: [
      { q: "How long is EPA RRP firm certification valid?", a: "5 years. $550 to renew." },
      { q: "Do I need RRP if I work on houses before 1978?", a: "Yes, if the work disturbs painted surfaces. RRP covers virtually all remodeling on pre-1978 housing." },
    ],
  },

  // ─── City License Guides ──────────────────────────────────────
  {
    slug: "minneapolis-contractor-license",
    title: "Minneapolis Contractor License: $165 Annual Registration",
    description:
      "Minneapolis requires a city contractor license ($165, annual) for contractors working in city limits. Separate from state DLI license.",
    targetQuery: "minneapolis contractor license",
    category: "city",
    quickFacts: [
      { label: "Fee", value: "$165" },
      { label: "Cycle", value: "Annual" },
      { label: "Authority", value: "City of Minneapolis CCS" },
      { label: "Portal", value: "minneapolismn.gov/business-services/construction-development" },
    ],
    leadAnswer:
      "Minneapolis requires contractors to hold a city-level contractor license ($165/year) in addition to their MN DLI license. This applies to most trades working within Minneapolis city limits.",
    sections: [
      { heading: "What it covers", body: "The Minneapolis contractor license is a registration — not a skills license. It's proof that your business is legitimate, insured, and authorized to operate within city limits. Most trades (plumbing, electrical, HVAC, general) need it separately from their state DLI license." },
      { heading: "Requirements", body: "Active state DLI license in your trade, general liability insurance proof (ACORD 25), workers' comp proof if applicable, business address, and the $165 fee. City verifies all three items before issuing." },
      { heading: "Renewal timing", body: "Annual. The Minneapolis CCS (Construction Code Services) department processes renewals. Late renewals incur fees and can halt your ability to pull city permits — critical to avoid during active projects." },
    ],
    cta: { heading: "Track both state + Minneapolis renewals", button: "Free trial" },
    related: ["st-paul-contractor-license", "mn-plumbing-license-renewal", "general-liability-insurance-contractors"],
    faqs: [
      { q: "Is a Minneapolis contractor license the same as a state license?", a: "No — they're separate. You need both to work in Minneapolis." },
      { q: "How much is a Minneapolis contractor license?", a: "$165 per year." },
    ],
  },

  {
    slug: "st-paul-contractor-license",
    title: "St. Paul Contractor License: $155 Annual, Issued by DSI",
    description:
      "St. Paul contractor license is $155 per year through the Department of Safety and Inspections (DSI). Required for contractors working in city limits.",
    targetQuery: "st paul contractor license",
    category: "city",
    quickFacts: [
      { label: "Fee", value: "$155" },
      { label: "Cycle", value: "Annual" },
      { label: "Authority", value: "City of St. Paul DSI" },
      { label: "Contact", value: "dsi.contractors@ci.stpaul.mn.us" },
    ],
    leadAnswer:
      "Saint Paul requires a city contractor license ($155/year) through the Department of Safety and Inspections (DSI), on top of your MN DLI trade license. Required for contractor work within St. Paul city limits.",
    sections: [
      { heading: "Difference from Minneapolis", body: "St. Paul's license process is administered by DSI, not a separate construction code department. Fee is $155 vs Minneapolis's $165. Application and renewal are online through the DSI portal." },
      { heading: "Requirements", body: "Active MN DLI license, proof of general liability insurance, workers' comp if applicable, and the $155 fee. Certain specialty contractors (e.g., house drain contractors) have additional sub-licenses." },
      { heading: "House drain contractor sublicense", body: "Plumbers doing sewer/drain work in St. Paul also need the House Drain Contractor license. The full list of currently-licensed house drain contractors is posted publicly by the city." },
    ],
    cta: { heading: "Stack your MN DLI + St. Paul renewals", button: "Track both free" },
    related: ["minneapolis-contractor-license", "mn-plumbing-license-renewal"],
    faqs: [
      { q: "How much is a St. Paul contractor license?", a: "$155 per year." },
      { q: "Is a St. Paul contractor license separate from MN DLI?", a: "Yes. Both are required to work in St. Paul." },
    ],
  },

  {
    slug: "milwaukee-contractor-registration",
    title: "Milwaukee Contractor Registration: $80 Annual Through DNS",
    description: "Milwaukee requires contractor registration ($80/year) through the Department of Neighborhood Services for any work within city limits.",
    targetQuery: "milwaukee contractor registration",
    category: "city",
    quickFacts: [
      { label: "Fee", value: "$80" },
      { label: "Cycle", value: "Annual" },
      { label: "Authority", value: "City of Milwaukee DNS" },
    ],
    leadAnswer:
      "Milwaukee requires a contractor registration ($80/year) through the Department of Neighborhood Services (DNS) for any contractor work within city limits. This is in addition to your WI DSPS credential.",
    sections: [
      { heading: "DNS Inspection sections", body: "Milwaukee DNS has separate inspection sections for electrical and plumbing work. Electrical: (414) 286-2532. Plumbing: (414) 286-3361. Register your business, then pull permits through the relevant section when starting a project." },
      { heading: "What's required", body: "WI DSPS credential (master plumber, master electrician, HVAC qualifier, etc.), general liability insurance ($1M recommended), workers' comp if applicable, business address in the application, and the $80 fee." },
    ],
    cta: { heading: "Track Milwaukee + WI DSPS renewals together", button: "Free trial" },
    related: ["madison-contractor-license", "wi-master-plumber-license-renewal", "wi-master-electrician-license-renewal"],
    faqs: [
      { q: "How much is a Milwaukee contractor registration?", a: "$80 per year through DNS." },
      { q: "Do I need city registration if I already have WI DSPS credential?", a: "Yes. The city registration is separate from the state credential." },
    ],
  },

  {
    slug: "madison-contractor-license",
    title: "Madison, WI Contractor License: $60 Annual",
    description: "Madison requires a city contractor license ($60 annual) through Building Inspection for contractors working within city limits.",
    targetQuery: "madison wi contractor license",
    category: "city",
    quickFacts: [
      { label: "Fee", value: "$60" },
      { label: "Cycle", value: "Annual" },
      { label: "Authority", value: "City of Madison Building Inspection" },
    ],
    leadAnswer: "Madison, Wisconsin requires a city contractor license ($60/year) through Building Inspection, on top of WI DSPS credentials.",
    sections: [
      { heading: "Lower fee than other WI cities", body: "Madison's $60 license is notably lower than Milwaukee's $80 registration. Application is handled through the Madison Building Inspection department, and you need an active WI DSPS credential as the basis for the license." },
      { heading: "Permit process", body: "Once licensed, you can pull permits through Madison's online permit portal. Each trade (plumbing, electrical, mechanical) has separate permit fees based on project scope." },
    ],
    cta: { heading: "Track Madison + DSPS renewals", button: "Free trial" },
    related: ["milwaukee-contractor-registration", "wi-master-plumber-license-renewal"],
    faqs: [
      { q: "How much is a Madison WI contractor license?", a: "$60 per year." },
    ],
  },

  // ─── Document Template Guides ─────────────────────────────────
  {
    slug: "acord-25-certificate-of-insurance",
    title: "ACORD 25 Certificate of Liability Insurance: Template + Explanation",
    description: "ACORD 25 is the industry-standard Certificate of Liability Insurance. What it shows, how to fill it, and when GCs ask for it.",
    targetQuery: "acord 25 certificate of insurance",
    category: "document",
    quickFacts: [
      { label: "Form Number", value: "ACORD 25" },
      { label: "Issued By", value: "Your insurance broker/agent" },
      { label: "Typical Required Limits", value: "$1M per occurrence / $2M aggregate (CGL)" },
      { label: "Validity", value: "Until any listed policy expires (usually 12 months)" },
    ],
    leadAnswer:
      "The ACORD 25 Certificate of Liability Insurance is the single-page industry-standard form proving a contractor's insurance coverage. It shows General Liability, Auto, Workers' Comp, and Umbrella coverage with policy numbers, effective dates, and limits.",
    sections: [
      { heading: "What's on it", body: "Top: producer (broker) and insured (you). Middle: the insurers (A, B, C...) writing each policy. Main section: coverage type, policy number, effective/expiration dates, and limits for each policy. Bottom: the certificate holder (the GC or owner requesting it) and a description of operations/locations." },
      { heading: "Why it's not binding", body: "Big yellow box at the top: 'THIS CERTIFICATE IS ISSUED AS A MATTER OF INFORMATION ONLY.' It doesn't modify your actual policy. The GC can request an Additional Insured Endorsement (separate form) that actually names them on your policy. Never sign anything that waives the ACORD disclaimer." },
      { heading: "When GCs ask for it", body: "Most commercial GCs require a current ACORD 25 before you start work. They file it in their project records. If any of your policies expires during the project, they'll ask for an updated ACORD 25. Keep a current PDF on your phone." },
      { heading: "Generating one", body: "Your insurance broker issues ACORD 25 on request, typically free and within 24 hours. Some agents have self-service portals where you can generate them anytime. If you need dozens for different projects, ask about batch generation." },
    ],
    cta: { heading: "Generate branded ACORD 25 on demand — auto-filled from your profile", button: "Try free" },
    related: ["general-liability-insurance-contractors", "workers-comp-mn-wi-contractors", "aia-g702-payment-application"],
    faqs: [
      { q: "Is ACORD 25 the same as a Certificate of Insurance?", a: "Yes — 'Certificate of Insurance' is the generic term; ACORD 25 is the specific industry-standard form that almost everyone actually uses." },
      { q: "Does ACORD 25 expire?", a: "The certificate itself doesn't; it becomes invalid when any listed policy expires. Most are effective for 12 months (until the first policy expires)." },
    ],
  },

  {
    slug: "aia-g702-payment-application",
    title: "AIA G702 Application for Payment: How to Fill + G703 Continuation Sheet",
    description: "AIA G702 is the standard payment application for commercial construction. Paired with G703 Schedule of Values. Free template.",
    targetQuery: "aia g702 payment application",
    category: "document",
    quickFacts: [
      { label: "Form", value: "AIA G702 + G703 Continuation Sheet" },
      { label: "Use Case", value: "Commercial construction progress billing" },
      { label: "Typical Frequency", value: "Monthly" },
      { label: "Retainage", value: "5-10% standard" },
    ],
    leadAnswer:
      "The AIA G702 Application and Certification for Payment is the industry-standard monthly billing form for commercial construction projects. It's paired with the G703 Continuation Sheet (Schedule of Values) which breaks down the contract sum by line item.",
    sections: [
      { heading: "G702 vs G703", body: "G702 is the one-page summary — total contract, change orders, percent complete, amount due this period. G703 is the multi-line detail — breaks the contract sum into line items (general conditions, demo, rough plumbing, finishes...) and tracks completed/stored/balance for each. You submit both together." },
      { heading: "Retainage", body: "Most commercial contracts withhold 5-10% of each payment as 'retainage' — held until the project is substantially complete (AIA G704). On a $500K contract with 10% retainage, you're not paid the last $50K until the end. Factor this into cash flow projections." },
      { heading: "How payment review works", body: "You submit G702+G703. Architect reviews (has ~7 days in most AIA contracts). Architect either certifies the amount or certifies a smaller amount with notes. Owner pays within 30 days of certification. Typical total lag: 30-45 days from application to cash." },
      { heading: "Common rejection reasons", body: "(1) Line items don't match the approved Schedule of Values — you can't add items mid-project without a change order. (2) Percent complete is optimistic — architect may reduce. (3) Stored materials without proper documentation — materials billed as 'stored' need receipts + storage location proof. (4) Math errors — the G703 totals must reconcile to the G702." },
    ],
    cta: { heading: "Auto-fill G702+G703 from your project data", button: "Try free" },
    related: ["aia-g704-substantial-completion", "mechanics-lien-mn-wi", "prevailing-wage-davis-bacon"],
    faqs: [
      { q: "Is AIA G702 required on all commercial projects?", a: "Most commercial contracts reference AIA forms. Some contractors use custom billing forms — check your contract." },
      { q: "What's retainage on AIA G702?", a: "5-10% of each payment is withheld until substantial completion (documented on AIA G704)." },
    ],
  },

  {
    slug: "mechanics-lien-mn-wi",
    title: "Mechanics Lien in MN and WI: Deadlines, Notice to Owner, Filing",
    description: "How to file a mechanics lien in MN (120 days after last work) and WI (6 months). Pre-lien notice rules differ — miss them, lose lien rights.",
    targetQuery: "mechanics lien mn wi filing",
    category: "document",
    quickFacts: [
      { label: "MN Pre-Lien Notice", value: "Within 45 days of first work" },
      { label: "WI Pre-Lien Notice", value: "Within 60 days of first work" },
      { label: "MN Filing Deadline", value: "120 days after last work" },
      { label: "WI Filing Deadline", value: "6 months after last work" },
    ],
    leadAnswer:
      "Mechanics liens protect your right to payment by filing a claim against the property itself. Both MN and WI require a pre-lien notice to the property owner (MN: within 45 days of first work; WI: within 60 days). Missing the pre-lien notice kills your lien rights entirely.",
    sections: [
      { heading: "The pre-lien notice trap", body: "The single most common way contractors lose lien rights is forgetting the pre-lien 'Notice to Owner' — a statutory form you must send within a narrow window after starting work. It feels absurd to send paperwork when you're just starting a project, but if you skip it and the owner doesn't pay 60 days later, you have no leverage." },
      { heading: "MN mechanics lien timeline", body: "(1) Within 45 days of first work: serve Pre-Lien Notice to Owner via certified mail. (2) Keep records of materials delivered + hours worked. (3) If not paid: file the lien with the county recorder within 120 days of your last work. (4) To enforce: file suit within 1 year of lien filing." },
      { heading: "WI mechanics lien timeline", body: "(1) Within 60 days of first work: serve Notice to Owner. (2) If not paid: file lien within 6 months of last work. (3) Enforce by filing suit within 2 years of lien." },
      { heading: "When to send the pre-lien notice", body: "Every time. Even on small jobs. Even with longtime clients. The cost of sending a pre-lien notice is near-zero; the cost of not having lien rights on a $50K job that goes sideways is massive." },
    ],
    cta: { heading: "Auto-generate Notice to Owner on every project", button: "Protect my lien rights" },
    related: ["notice-to-owner-statutory-pre-lien", "lien-waiver-conditional-unconditional"],
    faqs: [
      { q: "When is the MN mechanics lien deadline?", a: "File within 120 days after your last day of work on the project." },
      { q: "Do I need a pre-lien notice in WI?", a: "Yes — within 60 days of first work. Skipping it forfeits your lien rights." },
    ],
  },

  {
    slug: "notice-to-owner-statutory-pre-lien",
    title: "Notice to Owner (Pre-Lien Notice): MN 45 Days, WI 60 Days",
    description: "Statutory Notice to Owner required for mechanics lien rights in MN (45 days) and WI (60 days). Template + step-by-step explained.",
    targetQuery: "notice to owner pre lien notice",
    category: "document",
    quickFacts: [
      { label: "MN Deadline", value: "Within 45 days of first work" },
      { label: "WI Deadline", value: "Within 60 days of first work" },
      { label: "Delivery", value: "Certified mail, return receipt" },
      { label: "Consequence of Missing", value: "Forfeits lien rights" },
    ],
    leadAnswer:
      "The Notice to Owner (aka Statutory Pre-Lien Notice) is a required disclosure telling the property owner that you're performing work or supplying materials and that you reserve the right to file a mechanics lien if not paid. MN requires it within 45 days; WI within 60 days.",
    sections: [
      { heading: "What it has to say", body: "Identifies you (the claimant), identifies the work, identifies the person who hired you, discloses the property address, and includes the statutory lien-rights language. The exact language varies by state — use the current statutory form to avoid the notice being ruled invalid." },
      { heading: "How to deliver", body: "Certified mail with return receipt to the property owner (not just the GC who hired you). Keep the receipt. Some states accept personal service or posting on the property. Email is rarely sufficient alone." },
      { heading: "When to send", body: "As soon as you know you're doing work — don't wait until halfway through. Start the clock from your first day on site or first delivery of materials, whichever is earlier." },
    ],
    cta: { heading: "Auto-generate Notice to Owner from your project info", button: "Try free" },
    related: ["mechanics-lien-mn-wi", "lien-waiver-conditional-unconditional"],
    faqs: [
      { q: "When do I send a Notice to Owner in MN?", a: "Within 45 days of first performing work or delivering materials." },
      { q: "Can I send Notice to Owner by regular mail?", a: "Certified mail with return receipt is strongly recommended — and required in some states for lien rights." },
    ],
  },

  {
    slug: "lien-waiver-conditional-unconditional",
    title: "Conditional vs Unconditional Lien Waivers: When to Use Each",
    description: "Conditional lien waiver = 'if paid.' Unconditional = 'paid in full, no rights.' Learn when to sign each to protect your payment rights.",
    targetQuery: "conditional vs unconditional lien waiver",
    category: "document",
    quickFacts: [
      { label: "Conditional (Partial)", value: "Release rights IF payment clears" },
      { label: "Unconditional (Partial)", value: "Release rights for amount paid, full stop" },
      { label: "Conditional (Final)", value: "Release all rights IF final payment clears" },
      { label: "Unconditional (Final)", value: "Release all rights, full stop" },
    ],
    leadAnswer:
      "Lien waivers come in 4 flavors: partial or final × conditional or unconditional. Sign the conditional version when you're being paid (protects you if the check bounces). Sign the unconditional only AFTER payment has actually cleared your bank.",
    sections: [
      { heading: "Why conditional protects you", body: "A conditional waiver says 'I release my lien rights IF the payment I'm being promised actually clears.' If the check bounces, the release evaporates and your lien rights are intact. An unconditional waiver says 'I release my lien rights, period' — if you sign it and the check bounces, you have no leverage." },
      { heading: "The partial vs final distinction", body: "Partial waivers release rights for a specific progress payment (e.g., 'April pay app, $45K'). Final waivers release ALL rights to any payment on the project — use only when you've been paid in full and the project is closed out." },
      { heading: "Best practice", body: "When a GC asks for a waiver in exchange for payment, send them a conditional partial waiver with the payment amount filled in. When the payment clears, send them the matching unconditional partial waiver. Many GCs accept this 2-step process without complaint." },
    ],
    cta: { heading: "Auto-generate lien waivers from your project data", button: "Try free" },
    related: ["mechanics-lien-mn-wi", "notice-to-owner-statutory-pre-lien", "aia-g702-payment-application"],
    faqs: [
      { q: "Should I sign a conditional or unconditional lien waiver?", a: "Conditional when you're being paid (protects against bounced checks). Unconditional only after payment has cleared your bank." },
      { q: "Is a conditional lien waiver legally binding?", a: "Yes — it's enforceable, but contingent on the payment actually clearing." },
    ],
  },

  {
    slug: "osha-300-log-reporting",
    title: "OSHA 300 Log: Recording Injuries + Annual 300A Summary Requirements",
    description:
      "Employers with 11+ employees must keep an OSHA 300 log of work-related injuries. 300A annual summary posted Feb 1 - Apr 30. Construction rules explained.",
    targetQuery: "osha 300 log requirements",
    category: "document",
    quickFacts: [
      { label: "Required At", value: "11+ employees (with industry exemptions)" },
      { label: "Forms", value: "OSHA 300 (log) + 300A (annual summary) + 301 (incident report)" },
      { label: "Annual Posting", value: "Feb 1 - Apr 30" },
      { label: "Retention", value: "5 years" },
    ],
    leadAnswer:
      "Employers with 11+ employees must maintain an OSHA 300 log of all recordable work-related injuries and illnesses. An annual OSHA 300A summary must be posted conspicuously in each workplace from February 1 through April 30.",
    sections: [
      { heading: "What counts as 'recordable'", body: "Death, days away from work, restricted work, transfer to another job, medical treatment beyond first aid, loss of consciousness, or significant injury/illness diagnosed by a healthcare professional. Every construction employer should know this list cold — getting it wrong either direction (over- or under-recording) creates OSHA exposure." },
      { heading: "The three forms", body: "OSHA 300 (Log of Work-Related Injuries and Illnesses) — running record. OSHA 300A (Summary) — end-of-year summary, must be posted Feb 1 - Apr 30 and kept for 5 years. OSHA 301 (Injury and Illness Incident Report) — filled out within 7 days of each recordable injury with detailed circumstances." },
      { heading: "Electronic submission", body: "Some industries (including construction over certain sizes) must submit 300A data electronically to OSHA by March 2 each year. Check OSHA's Injury Tracking Application (ITA) for your requirement level." },
      { heading: "Most common mistake", body: "Recording only 'major' injuries. Even first aid-only incidents can be recordable if they result in days away or restricted work later. When in doubt, log it — better to over-record than under-record during an OSHA audit." },
    ],
    cta: { heading: "Auto-log OSHA 300 entries + generate 300A summary", button: "Try free" },
    related: ["incident-report-osha-301", "toolbox-talk-osha-safety", "jha-job-hazard-analysis"],
    faqs: [
      { q: "Who has to keep an OSHA 300 log?", a: "Most employers with 11+ employees. Some industries are partially exempt." },
      { q: "When does the OSHA 300A have to be posted?", a: "February 1 through April 30 of each year, in a conspicuous workplace location." },
    ],
  },

  {
    slug: "prevailing-wage-davis-bacon",
    title: "Prevailing Wage (Davis-Bacon) on Public Projects: Certified Payroll Rules",
    description: "Davis-Bacon prevailing wage applies to federal projects > $2,000. MN has a state version. Certified payroll (WH-347) required weekly.",
    targetQuery: "prevailing wage davis bacon certified payroll",
    category: "document",
    quickFacts: [
      { label: "Federal Trigger", value: "Construction projects > $2,000" },
      { label: "State (MN)", value: "State-funded projects (Ch. 177.41)" },
      { label: "Required Form", value: "WH-347 (Certified Payroll)" },
      { label: "Frequency", value: "Weekly" },
    ],
    leadAnswer:
      "The federal Davis-Bacon Act requires prevailing wages on federally-funded construction projects over $2,000. Minnesota's Prevailing Wage Act (Chapter 177.41) covers state-funded work. Both require weekly certified payroll submissions on Form WH-347.",
    sections: [
      { heading: "What 'prevailing wage' means", body: "The Department of Labor (federal) or MN DLI (state) publishes wage rates for each trade in each region. On a covered project, you pay workers at or above those rates. The rates often exceed non-prevailing-wage market rates by 20-60%, especially for fringe benefits." },
      { heading: "Certified payroll (WH-347)", body: "Due weekly for every week of work on a covered project. Shows each worker's name, classification, hours, wage rate, and fringe benefits. Signed under penalty of perjury by an officer of the contractor. A single incorrect WH-347 is a false claim — can trigger federal fraud charges." },
      { heading: "Fringe benefits", body: "Many contractors trip up here. Fringe can be paid as cash (add to the hourly rate) or as actual benefits (health insurance, retirement contributions, training funds). If paid as cash, the W-2 wages go up and so does the worker's tax burden. If paid as benefits, the benefits must actually be received by the worker." },
      { heading: "Debarment risk", body: "Willful or repeated violations of Davis-Bacon can result in 3-year debarment from all federal projects. This is existential for contractors who work public projects." },
    ],
    cta: { heading: "Generate WH-347 weekly on autopilot", button: "Try free" },
    related: ["wh-347-certified-payroll", "sam-gov-registration-federal-contracts"],
    faqs: [
      { q: "Does Davis-Bacon apply to all government projects?", a: "Federal projects over $2,000 always. State and local projects may have separate prevailing wage laws." },
      { q: "How often is WH-347 due?", a: "Weekly — one for every week of work on a covered project." },
    ],
  },

  // ─── Federal / Miscellaneous ─────────────────────────────────
  {
    slug: "sam-gov-registration-federal-contracts",
    title: "SAM.gov Registration for Federal Contracts: Free, Annual Renewal",
    description: "SAM.gov registration (free) required for federal contracts. Renewed annually. UEI + CAGE code. Lapsed registration = ineligible for federal work.",
    targetQuery: "sam.gov registration federal contracts",
    category: "permit",
    quickFacts: [
      { label: "Fee", value: "Free" },
      { label: "Cycle", value: "Annual" },
      { label: "Identifier", value: "Unique Entity Identifier (UEI)" },
      { label: "Portal", value: "sam.gov/content/entity-registration" },
    ],
    leadAnswer:
      "System for Award Management (SAM) registration is required (and free) for any business seeking federal contracts or grants. Renewal is annual. A lapsed SAM registration makes you immediately ineligible for federal work.",
    sections: [
      { heading: "Who needs it", body: "Any business bidding on federal contracts, receiving federal grants, or acting as a subcontractor on federally-funded projects. Trade contractors doing public works funded by federal agencies (GSA, VA, DOD, HUD) need SAM registration." },
      { heading: "UEI replaced DUNS", body: "In 2022, the Unique Entity Identifier (UEI) replaced the DUNS number. If you're still using a DUNS, migrate to UEI. SAM will show you your UEI once registered." },
      { heading: "NAICS codes", body: "During SAM registration you pick NAICS codes for your business — 236xxx (building construction), 237xxx (heavy/civil), 238xxx (specialty trades). These determine which federal opportunities match your business in the federal bidding system." },
      { heading: "Annual renewal", body: "Even if nothing has changed, SAM requires an annual renewal. Skipping a year immediately locks you out of federal bids. Set a calendar reminder." },
    ],
    cta: { heading: "Add SAM.gov to your deadline tracker", button: "Free trial" },
    related: ["prevailing-wage-davis-bacon", "mn-unemployment-insurance-quarterly-report"],
    faqs: [
      { q: "Is SAM.gov registration free?", a: "Yes. Any service charging to 'register' you for SAM is a scam." },
      { q: "How often do I renew SAM.gov?", a: "Annually, even if nothing has changed." },
    ],
  },

  {
    slug: "mn-unemployment-insurance-quarterly-report",
    title: "MN Unemployment Insurance Quarterly Wage Report: Due Dates + E-File",
    description: "MN employers file quarterly UI wage reports with DEED. Q1 due Apr 30, Q2 Jul 31, Q3 Oct 31, Q4 Jan 31. Electronic filing required.",
    targetQuery: "mn unemployment insurance quarterly report",
    category: "permit",
    quickFacts: [
      { label: "Authority", value: "MN DEED Unemployment Insurance" },
      { label: "Q1", value: "April 30" },
      { label: "Q2", value: "July 31" },
      { label: "Q3", value: "October 31" },
      { label: "Q4", value: "January 31" },
    ],
    leadAnswer: "Minnesota employers must file quarterly unemployment insurance wage reports with DEED. Reports are due the last day of the month following each quarter end. Electronic filing is required.",
    sections: [
      { heading: "What's reported", body: "Total wages paid to each employee that quarter, plus any UI tax due. DEED calculates your tax rate based on your experience rating — companies with higher turnover / layoff history pay more." },
      { heading: "E-filing requirement", body: "MN requires electronic filing through uimn.org. Paper filings are rejected. The portal is free to use; many accountants handle the filing for you as part of standard payroll services." },
      { heading: "Late penalties", body: "First late filing: $25 penalty. Escalates on subsequent violations. More importantly, late filings can trigger UI rate increases for future quarters — much more expensive long-term." },
    ],
    cta: { heading: "Add quarterly UI reports to your deadline tracker", button: "Free trial" },
    related: ["wi-unemployment-insurance-quarterly-report", "sam-gov-registration-federal-contracts"],
    faqs: [
      { q: "When is MN Q1 UI report due?", a: "April 30." },
      { q: "Can I paper-file MN UI reports?", a: "No — electronic filing through uimn.org is required." },
    ],
  },

  {
    slug: "wi-unemployment-insurance-quarterly-report",
    title: "WI Unemployment Insurance Quarterly Report: Due Dates + Online Filing",
    description: "WI employers file quarterly UI reports with DWD. Q1 due Apr 30, Q2 Jul 31, Q3 Oct 31, Q4 Jan 31. Online filing through WI DWD portal.",
    targetQuery: "wisconsin unemployment insurance quarterly report",
    category: "permit",
    quickFacts: [
      { label: "Authority", value: "WI Department of Workforce Development" },
      { label: "Frequency", value: "Quarterly" },
      { label: "Late Penalty", value: "10% of contributions or $10, whichever greater" },
    ],
    leadAnswer:
      "Wisconsin employers must file quarterly contribution and wage reports with DWD. Reports are due the last day of the month following each quarter end.",
    sections: [
      { heading: "Filing process", body: "Online through the WI DWD portal. Reports include total wages paid to each employee and UI tax due. Your UI rate is based on experience rating." },
      { heading: "Late penalties", body: "10% of contributions due or $10, whichever is greater. Plus potential rate increases in future quarters." },
    ],
    cta: { heading: "Track quarterly WI UI reports automatically", button: "Free trial" },
    related: ["mn-unemployment-insurance-quarterly-report", "sam-gov-registration-federal-contracts"],
    faqs: [
      { q: "When is WI Q2 UI report due?", a: "July 31." },
      { q: "Do WI employers have to e-file UI reports?", a: "Yes — online filing is standard." },
    ],
  },

  {
    slug: "mn-fire-protection-contractor-license",
    title: "MN Fire Protection Contractor License: NICET Required",
    description:
      "MN Fire Protection Contractor license required for sprinkler, standpipe, and chemical suppression work. NICET certification + insurance + bond.",
    targetQuery: "mn fire protection contractor license",
    category: "license",
    quickFacts: [
      { label: "Authority", value: "MN State Fire Marshal" },
      { label: "Fee", value: "$150-$300 depending on class" },
      { label: "Cycle", value: "Annual" },
      { label: "NICET Required", value: "Yes, for principal officer" },
    ],
    leadAnswer: "Minnesota requires a Fire Protection Contractor license for any business installing, altering, or servicing fire protection systems. License classes include FP-1 (water-based, all sizes), FP-2 (residential 2-family), and FP-3 (pre-engineered).",
    sections: [
      { heading: "NICET certification", body: "The principal officer of a fire protection contracting business must hold NICET certification (or equivalent) in the applicable fire protection discipline. NICET Level II or III typically required depending on license class." },
      { heading: "Insurance + bond", body: "Workers' comp and general liability required. Check State Fire Marshal current bond requirements — they can change with statute updates." },
      { heading: "Related permits", body: "Each installation typically requires a permit from the local Authority Having Jurisdiction (AHJ). Separate from the state contractor license." },
    ],
    cta: { heading: "Track fire protection license + NICET renewal", button: "Free trial" },
    related: ["mn-hvac-mechanical-license-renewal", "general-liability-insurance-contractors"],
    faqs: [
      { q: "Who regulates MN fire protection contractors?", a: "Minnesota State Fire Marshal." },
      { q: "Is NICET required for MN fire protection license?", a: "Yes, for the principal officer of the business." },
    ],
  },

  {
    slug: "wh-347-certified-payroll",
    title: "WH-347 Certified Payroll Form: How to Complete Weekly on Davis-Bacon",
    description: "The WH-347 is the US DOL certified payroll form required weekly on Davis-Bacon projects. Template + filling instructions explained.",
    targetQuery: "wh-347 certified payroll form",
    category: "document",
    quickFacts: [
      { label: "Form", value: "US DOL WH-347" },
      { label: "Required On", value: "Davis-Bacon federal projects > $2,000" },
      { label: "Frequency", value: "Weekly per project" },
      { label: "Signed Under", value: "Penalty of perjury" },
    ],
    leadAnswer: "The WH-347 Certified Payroll form must be submitted weekly on every federal project covered by the Davis-Bacon Act. Each worker's classification, hours, wage rate, and fringe benefits are listed, and an officer of the contractor signs under penalty of perjury.",
    sections: [
      { heading: "What's on the form", body: "Project name and location, contractor info, payroll number, week ending date. Each worker: name, social security (last 4), work classification, hours worked each day of the week, total hours, rate of pay, gross wages earned, deductions, net wages. Fringe benefits section at the bottom." },
      { heading: "Statement of compliance", body: "Page 2 of WH-347 is the statement of compliance — signed under penalty of perjury. If you sign it knowing information on page 1 is wrong, you've committed perjury. This is why certified payroll errors can escalate to federal fraud charges." },
      { heading: "Fringe benefits calculation", body: "Must show the actual prevailing wage fringe rate for each worker's classification. If paid as cash, add to the hourly rate. If paid as benefits, show the hourly equivalent. Errors here trip up a lot of first-time Davis-Bacon contractors." },
    ],
    cta: { heading: "Auto-generate WH-347 every week on Davis-Bacon projects", button: "Try free" },
    related: ["prevailing-wage-davis-bacon", "sam-gov-registration-federal-contracts"],
    faqs: [
      { q: "Who signs the WH-347?", a: "An officer of the contractor — under penalty of perjury. Usually the owner or CFO." },
      { q: "How often is WH-347 filed?", a: "Weekly for every week of work on a Davis-Bacon project." },
    ],
  },
];

export function getGuideBySlug(slug: string): SeoGuide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getRelatedGuides(guide: SeoGuide): SeoGuide[] {
  return guide.related
    .map((slug) => getGuideBySlug(slug))
    .filter((g): g is SeoGuide => g !== undefined);
}

export function getGuidesByCategory(category: SeoGuide["category"]): SeoGuide[] {
  return GUIDES.filter((g) => g.category === category);
}
