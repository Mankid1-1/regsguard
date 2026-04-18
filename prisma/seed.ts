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
      portalUrl: "https://www.dli.mn.gov/business/electrical-licensing",
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
      portalUrl: "https://www.dli.mn.gov/business/electrical-licensing",
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
      portalUrl: "https://www.dli.mn.gov/business/electrical-licensing",
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
      portalUrl: "https://www.dli.mn.gov/business/electrical-licensing",
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

    // ─── Trade-Specific Endorsements (HVAC/Sheet Metal) ───
    {
      trade: "HVAC" as const, state: "MN", title: "MN Sheet Metal Worker License",
      description: "Annual renewal of MN sheet metal worker license. Required for individuals fabricating, installing, or maintaining ductwork and sheet-metal building systems. Separate from general HVAC license.",
      authority: "MN DLI", officialEmail: "dli.license@state.mn.us",
      portalUrl: "https://www.dli.mn.gov/business/get-licenses-and-permits", fee: "$50",
      renewalCycle: "ANNUAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Renews on anniversary date. CE required. Online via DLI portal.", active: true,
    },
    {
      trade: "HVAC" as const, state: "WI", title: "WI Sheet Metal Worker Credential",
      description: "Wisconsin sheet metal worker credential renewal through DSPS. Required for ductwork fabrication and installation.",
      authority: "WI DSPS", officialEmail: null, portalUrl: "https://dsps.wi.gov",
      fee: "$45", renewalCycle: "BIENNIAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6, defaultDueDay: 30, notes: "Renews June 30 biennially. CE required.", active: true,
    },
    {
      trade: "HVAC" as const, state: "MN", title: "MN Boiler Operator License",
      description: "Annual renewal of MN boiler/pressure-vessel operator license required for operating commercial-grade boilers and high-pressure piping systems.",
      authority: "MN DLI", officialEmail: "dli.boiler@state.mn.us",
      portalUrl: "https://www.dli.mn.gov/business/get-licenses-and-permits", fee: "$30",
      renewalCycle: "ANNUAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Required for any boiler over 30 horsepower or 200 PSI. Different grades (1st-4th class).", active: true,
    },

    // ─── Septic / POWTS ───
    {
      trade: "PLUMBING" as const, state: "MN", title: "MN Septic Systems Installer (SSTS) License",
      description: "MN Subsurface Sewage Treatment System installer license. Required for installing, repairing, or pumping on-site septic systems. Issued by MPCA.",
      authority: "MN Pollution Control Agency", officialEmail: "ssts.staff.mpca@state.mn.us",
      portalUrl: "https://www.pca.state.mn.us/business/subsurface-sewage-treatment-system-ssts-program",
      fee: "$200", renewalCycle: "ANNUAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 12, defaultDueDay: 31,
      notes: "Year-end deadline. CE: 6 hours per renewal year required.", active: true,
    },
    {
      trade: "PLUMBING" as const, state: "WI", title: "WI POWTS Installer Credential",
      description: "Wisconsin Private Onsite Wastewater Treatment System installer credential.",
      authority: "WI DSPS", officialEmail: null,
      portalUrl: "https://dsps.wi.gov/Pages/Professions/POWTSInstaller/Default.aspx",
      fee: "$50", renewalCycle: "BIENNIAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6, defaultDueDay: 30, notes: "Renews June 30 biennially.", active: true,
    },

    // ─── Backflow / Cross-Connection ───
    {
      trade: "PLUMBING" as const, state: "MN", title: "MN Backflow Prevention Assembly Tester",
      description: "Certification required to test and certify backflow prevention assemblies in Minnesota. Renewed every 3 years through ABPA or ASSE certification.",
      authority: "MN Dept of Health (delegated to ABPA/ASSE)", officialEmail: null,
      portalUrl: "https://www.health.state.mn.us/communities/environment/water/backflow.html",
      fee: "$150", renewalCycle: "TRIENNIAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Certification through ABPA, ASSE, or AWWA. Renewal exam + CE typically required.", active: true,
    },
    {
      trade: "PLUMBING" as const, state: "WI", title: "WI Cross-Connection Control Tester",
      description: "WI credential to perform cross-connection control assembly testing (backflow).",
      authority: "WI DSPS", officialEmail: null,
      portalUrl: "https://dsps.wi.gov/Pages/Professions/CrossConnectionControlTester/Default.aspx",
      fee: "$100", renewalCycle: "BIENNIAL" as const, category: "LICENSE_RENEWAL" as const,
      defaultDueMonth: 6, defaultDueDay: 30, notes: "Renews June 30 biennially.", active: true,
    },

    // ─── EPA RRP Individual ───
    {
      trade: "LEAD_SAFE" as const, state: "MN", title: "EPA Lead-Safe RRP Individual Renovator Cert",
      description: "Individual renovator certification under EPA's Renovation, Repair and Painting (RRP) Rule. Required for anyone performing renovation in pre-1978 housing or child-occupied facilities. Separate from the firm certification.",
      authority: "EPA", officialEmail: null,
      portalUrl: "https://www.epa.gov/lead/lead-renovation-repair-and-painting-program",
      fee: "$300", renewalCycle: "FIVE_YEAR" as const, category: "EPA_CERTIFICATION" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Initial 8-hour course; 4-hour refresher every 5 years. Required for ALL workers, not just firms.", active: true,
    },

    // ─── OSHA Safety Renewals ───
    {
      trade: "GENERAL" as const, state: "MN", title: "OSHA 30-Hour Construction Card (Renewal)",
      description: "OSHA 30-hour construction safety training card. Many GCs require all workers on jobsites to hold a current card. Cards are recommended to be retaken every 5 years to maintain current best practices.",
      authority: "OSHA (via authorized trainers)", officialEmail: null,
      portalUrl: "https://www.osha.gov/training", fee: "$150-$250",
      renewalCycle: "FIVE_YEAR" as const, category: "SAFETY_TRAINING" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "OSHA does not officially expire 30-hour cards but most GCs require retake every 5 years.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "WI", title: "OSHA 30-Hour Construction Card (Renewal)",
      description: "OSHA 30-hour construction safety training card. Many GCs require all workers on jobsites to hold a current card.",
      authority: "OSHA (via authorized trainers)", officialEmail: null,
      portalUrl: "https://www.osha.gov/training", fee: "$150-$250",
      renewalCycle: "FIVE_YEAR" as const, category: "SAFETY_TRAINING" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "OSHA does not officially expire 30-hour cards but most GCs require retake every 5 years.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "MN", title: "Aerial / Scissor Lift Certification",
      description: "OSHA-required operator certification for aerial work platforms and scissor lifts. Per ANSI A92.24, operator must be re-evaluated every 3 years.",
      authority: "OSHA / ANSI A92", officialEmail: null,
      portalUrl: "https://www.osha.gov/aerial-lifts", fee: "$50-$200",
      renewalCycle: "TRIENNIAL" as const, category: "SAFETY_TRAINING" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Re-eval every 3 years; immediate re-training after any incident.", active: true,
    },

    // ─── Federal Tax Filings ───
    {
      trade: "GENERAL" as const, state: "MN", title: "IRS Form 941 (Quarterly Federal Tax)",
      description: "Employers must file IRS Form 941 quarterly to report income taxes, Social Security tax, and Medicare tax withheld from employee paychecks plus the employer portion. Due last day of month after the quarter ends.",
      authority: "IRS", officialEmail: null,
      portalUrl: "https://www.irs.gov/forms-pubs/about-form-941", fee: null,
      renewalCycle: "VARIES" as const, category: "REGISTRATION" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Due Apr 30, Jul 31, Oct 31, Jan 31 each year. EFTPS required for deposits.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "MN", title: "IRS Form 940 (Annual FUTA Return)",
      description: "Annual federal unemployment tax return. Due January 31 for the prior calendar year.",
      authority: "IRS", officialEmail: null,
      portalUrl: "https://www.irs.gov/forms-pubs/about-form-940", fee: null,
      renewalCycle: "ANNUAL" as const, category: "REGISTRATION" as const,
      defaultDueMonth: 1, defaultDueDay: 31,
      notes: "Filed alongside W-2 distribution. Quarterly deposits required if liability exceeds $500.", active: true,
    },

    // ─── State Tax Filings ───
    {
      trade: "GENERAL" as const, state: "MN", title: "MN Sales & Use Tax Return",
      description: "Minnesota sales and use tax return filed monthly, quarterly, or annually depending on volume. Contractors typically file on materials purchased and certain installed services.",
      authority: "MN Department of Revenue", officialEmail: null,
      portalUrl: "https://www.revenue.state.mn.us/sales-and-use-tax", fee: null,
      renewalCycle: "VARIES" as const, category: "REGISTRATION" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Filing frequency assigned by MN DOR based on prior-year sales tax volume.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "WI", title: "WI Sales & Use Tax Return",
      description: "Wisconsin sales and use tax return. Filing frequency varies by tax volume.",
      authority: "WI Department of Revenue", officialEmail: null,
      portalUrl: "https://www.revenue.wi.gov/Pages/SalesAndUse/Home.aspx", fee: null,
      renewalCycle: "VARIES" as const, category: "REGISTRATION" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Filing frequency assigned by WI DOR. My Tax Account portal for online filing.", active: true,
    },

    // ─── Workers Comp + Insurance ───
    {
      trade: "GENERAL" as const, state: "MN", title: "MN Workers' Compensation Insurance Annual Verification",
      description: "Annual verification that workers' compensation insurance is current and meets MN coverage requirements. Required for any business with employees.",
      authority: "MN Department of Labor and Industry", officialEmail: null,
      portalUrl: "https://www.dli.mn.gov/business/workers-compensation", fee: null,
      renewalCycle: "ANNUAL" as const, category: "INSURANCE" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Annual policy renewal. Lapses are reported to MN DLI and may trigger penalties.", active: true,
    },
    {
      trade: "HVAC" as const, state: "MN", title: "Pollution / Refrigerant Liability Insurance",
      description: "Pollution liability insurance recommended (and often required by GCs) for HVAC contractors handling refrigerants and chemical products.",
      authority: "Insurance Carrier", officialEmail: null,
      portalUrl: "https://www.epa.gov/section608/refrigerant-recycling-handling-and-disposal",
      fee: null, renewalCycle: "ANNUAL" as const, category: "INSURANCE" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Common limits: $1M/occurrence, $2M aggregate. Often a GC prequalification requirement.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "MN", title: "Commercial Auto Liability Insurance",
      description: "Commercial auto policy required for any vehicle used in the contracting business. Most GCs require $1M/occurrence minimum.",
      authority: "Insurance Carrier", officialEmail: null,
      portalUrl: "https://www.iii.org/article/business-vehicle-insurance",
      fee: null, renewalCycle: "ANNUAL" as const, category: "INSURANCE" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Required by GCs and ISN/Avetta portals. Symbol-1 (any auto) preferred.", active: true,
    },

    // ─── City-Level Contractor Registration ───
    {
      trade: "GENERAL" as const, state: "MN", title: "Minneapolis Contractor License",
      description: "City of Minneapolis Construction Code Services contractor license. Required to perform construction work in Minneapolis. Separate from state DLI license.",
      authority: "City of Minneapolis CCS", officialEmail: "ccs.licensing@minneapolismn.gov",
      portalUrl: "https://www2.minneapolismn.gov/business-services/construction-development/construction-contractor-licensing/",
      fee: "$165", renewalCycle: "ANNUAL" as const, category: "REGISTRATION" as const,
      defaultDueMonth: 12, defaultDueDay: 31,
      notes: "Calendar year — expires Dec 31. State license + insurance proof required.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "MN", title: "St. Paul Contractor License",
      description: "City of St. Paul Department of Safety and Inspections contractor license.",
      authority: "City of St. Paul DSI", officialEmail: "dsi.contractors@ci.stpaul.mn.us",
      portalUrl: "https://www.stpaul.gov/departments/safety-inspections/contractor-licensing",
      fee: "$155", renewalCycle: "ANNUAL" as const, category: "REGISTRATION" as const,
      defaultDueMonth: 12, defaultDueDay: 31,
      notes: "Calendar year. State license, $25K bond, GL insurance proof required.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "WI", title: "Madison Contractor License",
      description: "City of Madison contractor license issued by Building Inspection.",
      authority: "City of Madison Building Inspection", officialEmail: null,
      portalUrl: "https://www.cityofmadison.com/dpced/bi/contractor-licensing/",
      fee: "$60", renewalCycle: "ANNUAL" as const, category: "REGISTRATION" as const,
      defaultDueMonth: 6, defaultDueDay: 30, notes: "Mid-year renewal cycle.", active: true,
    },
    {
      trade: "GENERAL" as const, state: "WI", title: "Milwaukee Contractor Registration",
      description: "City of Milwaukee Department of Neighborhood Services contractor registration.",
      authority: "City of Milwaukee DNS", officialEmail: null,
      portalUrl: "https://city.milwaukee.gov/dns/permits/Contractor-Registration",
      fee: "$80", renewalCycle: "ANNUAL" as const, category: "REGISTRATION" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "State credential + bond + insurance required.", active: true,
    },

    // ─── DOT (commercial vehicles) ───
    {
      trade: "GENERAL" as const, state: "MN", title: "DOT Number / Biennial Update (MCS-150)",
      description: "Federal DOT number registration. Required for any commercial motor vehicle over 10,001 lbs operating in interstate commerce. MCS-150 update required every 2 years.",
      authority: "FMCSA / USDOT", officialEmail: null,
      portalUrl: "https://www.fmcsa.dot.gov/registration", fee: null,
      renewalCycle: "BIENNIAL" as const, category: "REGISTRATION" as const,
      defaultDueMonth: null, defaultDueDay: null,
      notes: "Update assigned by last digit of USDOT number. Failure to update results in deactivation.", active: true,
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
