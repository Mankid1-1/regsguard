import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding regulations...");

  const regulations = [
    // ─── MN Plumbing ───
    {
      trade: "PLUMBING" as const,
      state: "MN",
      title: "MN Plumber License Renewal",
      description:
        "Annual renewal of Minnesota plumbing license issued by the Department of Labor and Industry. All licensed plumbers (master, journeyworker, and restricted) must renew annually. Requires completion of 16 continuing education hours from an approved provider before renewal.",
      authority: "MN DLI",
      officialEmail: "dli.license@state.mn.us",
      portalUrl: "https://www.dli.mn.gov",
      fee: "$50",
      renewalCycle: "ANNUAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "Due on license anniversary date. 16 CE hours required per renewal period. Online renewal available through DLI portal. Late renewals subject to additional fees. License lapses if not renewed within 12 months of expiration.",
      active: true,
    },
    {
      trade: "PLUMBING" as const,
      state: "MN",
      title: "MN Plumbing Bond",
      description:
        "Minnesota requires all master plumbers and plumbing contractors to maintain a surety bond. The bond protects the public against faulty or substandard plumbing work. Bond must remain active and on file with the Department of Labor and Industry at all times while performing plumbing work.",
      authority: "MN DLI",
      officialEmail: "dli.license@state.mn.us",
      portalUrl: "https://www.dli.mn.gov",
      fee: "$25,000 bond required",
      renewalCycle: "ANNUAL" as const,
      category: "BONDING" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "Bond amount is $25,000. Must be obtained through a licensed surety company. Bond must be filed with DLI before license activation. Annual premium typically runs $100-$500 depending on credit and claims history.",
      active: true,
    },

    // ─── MN Electrical ───
    {
      trade: "ELECTRICAL" as const,
      state: "MN",
      title: "MN Master Electrician License",
      description:
        "Biennial renewal of Minnesota master electrician license through the Board of Electricity. Master electricians may supervise electrical installations and pull permits. Requires proof of 24 continuing education hours completed during the two-year renewal period.",
      authority: "MN Board of Electricity",
      officialEmail: null,
      portalUrl: "https://electricity.state.mn.us",
      fee: "$60",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "24 CE hours required per two-year renewal period. CE must include at least 2 hours on the National Electrical Code updates. Online renewal available. License expires on the last day of the licensee's birth month in even or odd years depending on license number.",
      active: true,
    },
    {
      trade: "ELECTRICAL" as const,
      state: "MN",
      title: "MN Journeyworker Electrician License",
      description:
        "Biennial renewal of Minnesota journeyworker electrician license. Journeyworker electricians may perform electrical installations under the supervision of a master electrician. Must complete 16 hours of approved continuing education during each renewal period.",
      authority: "MN Board of Electricity",
      officialEmail: null,
      portalUrl: "https://electricity.state.mn.us",
      fee: "$40",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "16 CE hours required per two-year renewal period. Must include NEC code update training. Renewal period aligns with master electrician schedule based on birth month.",
      active: true,
    },
    {
      trade: "ELECTRICAL" as const,
      state: "MN",
      title: "MN Registered Electrician (Unlicensed)",
      description:
        "Annual registration for unlicensed individuals performing electrical work under the direct supervision of a licensed electrician in Minnesota. Registration must be maintained at all times while performing electrical work. This is not a license but a required registration.",
      authority: "MN Board of Electricity",
      officialEmail: null,
      portalUrl: "https://electricity.state.mn.us",
      fee: "$20",
      renewalCycle: "ANNUAL" as const,
      category: "REGISTRATION" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "Must work under direct supervision of a licensed master or journeyworker electrician at all times. No CE requirement for registration renewal. Must be registered before beginning any electrical work.",
      active: true,
    },

    // ─── MN HVAC ───
    {
      trade: "HVAC" as const,
      state: "MN",
      title: "MN HVAC/Mechanical License",
      description:
        "Annual renewal of Minnesota HVAC and mechanical contractor license. Required for individuals and businesses performing heating, ventilation, air conditioning, and refrigeration work. Covers warm air heating, combustion systems, process piping, and hydronic heating systems.",
      authority: "MN DLI",
      officialEmail: "dli.license@state.mn.us",
      portalUrl: "https://www.dli.mn.gov",
      fee: "$50",
      renewalCycle: "ANNUAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "Renewal due on license anniversary date. Continuing education may be required depending on specific license class. Check DLI website for current CE requirements by license type.",
      active: true,
    },

    // ─── WI Plumbing ───
    {
      trade: "PLUMBING" as const,
      state: "WI",
      title: "WI Master Plumber License",
      description:
        "Biennial renewal of Wisconsin master plumber license through the Department of Safety and Professional Services. Master plumbers may design, install, and supervise plumbing systems. Renewal occurs on even-numbered years with a June 30 deadline.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: "$56",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "Renews June 30 of even-numbered years. Continuing education required per renewal period. Online renewal available through DSPS eLicensing portal. Late renewal subject to additional fees.",
      active: true,
    },
    {
      trade: "PLUMBING" as const,
      state: "WI",
      title: "WI Journeyman Plumber License",
      description:
        "Biennial renewal of Wisconsin journeyman plumber license. Journeyman plumbers may install and repair plumbing systems under the supervision of a master plumber. Same renewal schedule as master plumber license.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: "$56",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "Renews June 30 of even-numbered years. Continuing education required per renewal period. Online renewal available through DSPS eLicensing portal.",
      active: true,
    },

    // ─── WI Electrical ───
    {
      trade: "ELECTRICAL" as const,
      state: "WI",
      title: "WI Master Electrician License",
      description:
        "Biennial renewal of Wisconsin master electrician license through the Department of Safety and Professional Services. Master electricians may design, install, and supervise electrical systems and pull permits for electrical work.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: "$56",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "Renews biennially. Continuing education required per renewal period. Online renewal available through DSPS eLicensing portal.",
      active: true,
    },
    {
      trade: "ELECTRICAL" as const,
      state: "WI",
      title: "WI Journeyman Electrician License",
      description:
        "Biennial renewal of Wisconsin journeyman electrician license. Journeyman electricians may install and repair electrical systems under the supervision of a master electrician.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: "$56",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "Renews biennially. Continuing education required per renewal period. Online renewal available through DSPS eLicensing portal.",
      active: true,
    },

    // ─── WI HVAC ───
    {
      trade: "HVAC" as const,
      state: "WI",
      title: "WI HVAC Qualifier Credential",
      description:
        "Biennial renewal of Wisconsin HVAC qualifier credential through the Department of Safety and Professional Services. Required for individuals who qualify an HVAC contractor registration. Covers heating, ventilation, air conditioning, and refrigeration work.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: "$56",
      renewalCycle: "BIENNIAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "Renews biennially. Qualifier must maintain credential while HVAC contractor registration is active. Online renewal available through DSPS eLicensing portal.",
      active: true,
    },

    // ─── Federal / EPA ───
    {
      trade: "EPA" as const,
      state: "US",
      title: "EPA Section 608 Certification",
      description:
        "EPA Section 608 technician certification required for anyone who maintains, services, repairs, or disposes of equipment containing refrigerants. Certification types include Type I (small appliances), Type II (high-pressure), Type III (low-pressure), and Universal (all types). This is a lifetime certification with no renewal required.",
      authority: "US EPA",
      officialEmail: null,
      portalUrl: "https://www.epa.gov/section608",
      fee: "No fee for certification itself",
      renewalCycle: "ONE_TIME" as const,
      category: "EPA_CERTIFICATION" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "One-time certification, no renewal needed. However, EPA finalized rules for A2L mildly flammable refrigerants (R-32, R-454B) effective 2025. Technicians handling A2L refrigerants must complete supplemental training on safe handling practices. Check EPA website for latest A2L training requirements.",
      active: true,
    },
    {
      trade: "LEAD_SAFE" as const,
      state: "US",
      title: "EPA Lead-Safe RRP Firm Certification",
      description:
        "EPA Renovation, Repair, and Painting (RRP) firm certification required for any company performing renovation work that disturbs lead-based paint in pre-1978 housing and child-occupied facilities. Firms must be certified by EPA and must use certified renovators who follow lead-safe work practices.",
      authority: "US EPA",
      officialEmail: null,
      portalUrl: "https://www.epa.gov/lead",
      fee: "$550",
      renewalCycle: "FIVE_YEAR" as const,
      category: "EPA_CERTIFICATION" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "Five-year certification. Application fee is $550 for initial and renewal. Firms must ensure at least one certified renovator is assigned to each job. Renovators must complete EPA-accredited training. Failure to comply can result in fines up to $37,500 per day per violation.",
      active: true,
    },
    {
      trade: "LEAD_SAFE" as const,
      state: "MN",
      title: "MN Lead-Safe Firm License",
      description:
        "Minnesota Department of Health lead-safe firm license required for renovation firms working with lead-based paint in Minnesota. This is a state-level requirement in addition to federal EPA RRP certification. Firms must maintain both federal EPA certification and state MDH licensure.",
      authority: "MN MDH",
      officialEmail: null,
      portalUrl: "https://www.health.state.mn.us",
      fee: "$100",
      renewalCycle: "ANNUAL" as const,
      category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "Annual renewal through Minnesota Department of Health. Must have valid EPA RRP firm certification before applying. State license is required in addition to federal EPA certification when working in Minnesota.",
      active: true,
    },

    // ─── CE Requirements ───
    {
      trade: "PLUMBING" as const,
      state: "MN",
      title: "MN Plumbing CE (16 hours/year)",
      description:
        "Minnesota plumbers must complete 16 hours of approved continuing education each year before license renewal. CE courses must be approved by the Minnesota Department of Labor and Industry. Topics must include current plumbing code updates, safety practices, and relevant technical training.",
      authority: "MN DLI",
      officialEmail: "dli.license@state.mn.us",
      portalUrl: "https://www.dli.mn.gov",
      fee: null,
      renewalCycle: "ANNUAL" as const,
      category: "CONTINUING_EDUCATION" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "16 hours per year required. Must be completed before license renewal date. Courses must be from DLI-approved providers. Keep certificates of completion for at least 4 years. Online and in-person courses available.",
      active: true,
    },
    {
      trade: "ELECTRICAL" as const,
      state: "MN",
      title: "MN Electrical CE (24 hours/2 years)",
      description:
        "Minnesota licensed electricians must complete 24 hours of approved continuing education per two-year renewal period. CE must include training on National Electrical Code updates and other relevant topics approved by the Board of Electricity.",
      authority: "MN Board of Electricity",
      officialEmail: null,
      portalUrl: "https://electricity.state.mn.us",
      fee: null,
      renewalCycle: "BIENNIAL" as const,
      category: "CONTINUING_EDUCATION" as const,
      defaultDueMonth: null,
      defaultDueDay: null,
      notes:
        "24 hours per two-year period for master electricians. 16 hours per two-year period for journeyworker electricians. Must include at least 2 hours on NEC code updates. Approved provider list available on Board of Electricity website.",
      active: true,
    },
    {
      trade: "PLUMBING" as const,
      state: "WI",
      title: "WI Plumbing CE (12 hours/2 years)",
      description:
        "Wisconsin plumbers must complete 12 hours of approved continuing education per biennial renewal period. CE courses must be approved by the Wisconsin Department of Safety and Professional Services. Completion is required before license renewal.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: null,
      renewalCycle: "BIENNIAL" as const,
      category: "CONTINUING_EDUCATION" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "12 hours per two-year renewal period. Must be completed before June 30 renewal deadline. Approved providers listed on DSPS website. Online and in-person courses available.",
      active: true,
    },
    {
      trade: "ELECTRICAL" as const,
      state: "WI",
      title: "WI Electrical CE",
      description:
        "Wisconsin electricians must complete approved continuing education hours per biennial renewal period. CE courses must be approved by the Wisconsin Department of Safety and Professional Services. Requirements vary by license type.",
      authority: "WI DSPS",
      officialEmail: null,
      portalUrl: "https://dsps.wi.gov",
      fee: null,
      renewalCycle: "BIENNIAL" as const,
      category: "CONTINUING_EDUCATION" as const,
      defaultDueMonth: 6,
      defaultDueDay: 30,
      notes:
        "CE hours vary by license type. Must be completed before biennial renewal deadline. Approved providers listed on DSPS website. Online and in-person courses available.",
      active: true,
    },
  ];

  for (const reg of regulations) {
    await prisma.regulation.upsert({
      where: {
        trade_state_title: {
          trade: reg.trade,
          state: reg.state,
          title: reg.title,
        },
      },
      update: {
        description: reg.description,
        authority: reg.authority,
        officialEmail: reg.officialEmail,
        portalUrl: reg.portalUrl,
        fee: reg.fee,
        renewalCycle: reg.renewalCycle,
        category: reg.category,
        defaultDueMonth: reg.defaultDueMonth,
        defaultDueDay: reg.defaultDueDay,
        notes: reg.notes,
        active: reg.active,
      },
      create: {
        trade: reg.trade,
        state: reg.state,
        title: reg.title,
        description: reg.description,
        authority: reg.authority,
        officialEmail: reg.officialEmail,
        portalUrl: reg.portalUrl,
        fee: reg.fee,
        renewalCycle: reg.renewalCycle,
        category: reg.category,
        defaultDueMonth: reg.defaultDueMonth,
        defaultDueDay: reg.defaultDueDay,
        notes: reg.notes,
        active: reg.active,
      },
    });

    console.log(`  Upserted: ${reg.title} (${reg.state})`);
  }

  console.log(`\nSeeded ${regulations.length} regulations successfully.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
