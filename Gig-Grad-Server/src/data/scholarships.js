// Curated official sources reviewed on 2026-11-01. Rules are preliminary screening,
// not the complete scheme decision. No application deadline is inferred.
const NSP = "https://scholarships.gov.in/Students";
const reviewedOn = "2026-11-01";
const common = [
  "Admission/enrolment proof",
  "Academic marksheets",
  "Income certificate",
  "Applicant identity documents on the official portal",
];
const rule = (field, operator, value, label) => ({
  field,
  operator,
  value,
  label,
});
const scholarships = [
  {
    id: "pm-usp-csss",
    title: "PM-USP Central Sector Scholarship",
    provider: "Ministry of Education",
    category: "Merit & income",
    support:
      "Support for regular college and university study; award varies by course/year.",
    summary:
      "A route for students with strong Class XII board performance and limited family income.",
    officialUrl: "https://www.myscheme.gov.in/schemes/csss-cus",
    applicationUrl: NSP,
    reviewedOn,
    deadline: null,
    rules: [
      rule("indianCitizen", "eq", true, "Indian citizenship"),
      rule(
        "annualIncome",
        "max",
        450000,
        "Annual family income up to ₹4.5 lakh",
      ),
      rule(
        "boardPercentile",
        "gt",
        80,
        "Above the 80th board percentile (not percentage marks)",
      ),
      rule(
        "course",
        "in",
        ["general_degree", "technical_degree", "basic_science"],
        "Regular degree course",
      ),
      rule("regularCourse", "eq", true, "Regular, non-distance study"),
      rule("institutionApproved", "eq", true, "Recognized institution/course"),
      rule(
        "otherScholarship",
        "eq",
        false,
        "No other scholarship or fee reimbursement",
      ),
      rule("gapAfter12", "eq", false, "No gap after Class XII"),
    ],
    documents: common,
    confirm: [
      "Fresh versus renewal requirements and the applicable admission year",
      "Official merit list, board cutoffs and current application window",
    ],
    sourceNote:
      "Preliminary fresh-application criteria; renewal has separate conditions.",
  },
  {
    id: "aicte-pragati",
    title: "AICTE Pragati — Technical Degree",
    provider: "AICTE",
    category: "Women in technical education",
    support:
      "Education support for eligible women entering technical degree courses.",
    summary: "Designed to help women begin an AICTE-approved technical degree.",
    officialUrl: "https://www.myscheme.gov.in/schemes/psgs-deg",
    applicationUrl: NSP,
    reviewedOn,
    deadline: null,
    rules: [
      rule("indianCitizen", "eq", true, "Indian citizenship"),
      rule("gender", "eq", "female", "Girl/woman student"),
      rule("annualIncome", "max", 800000, "Annual family income up to ₹8 lakh"),
      rule("course", "eq", "technical_degree", "Technical degree course"),
      rule(
        "institutionApproved",
        "eq",
        true,
        "AICTE-approved institution/course",
      ),
      rule(
        "entry",
        "in",
        ["first_year", "lateral_second"],
        "First year, or second year through lateral entry",
      ),
      rule(
        "otherScholarship",
        "eq",
        false,
        "No conflicting financial assistance",
      ),
    ],
    documents: common,
    confirm: [
      "Family/sibling limits and selection rules in current guidelines",
      "Other financial assistance exclusions and current application window",
    ],
    sourceNote:
      "This entry covers the degree scheme; the diploma scheme has its own listing.",
  },
  {
    id: "aicte-saksham",
    title: "AICTE Saksham",
    provider: "AICTE",
    category: "Disability support",
    support:
      "The cited official scheme page lists ₹50,000 per year; confirm the current award.",
    summary:
      "Technical education support for students with benchmark disabilities.",
    officialUrl: "https://dte.uk.gov.in/scheme/saksham-scholarship-scheme/",
    additionalSources: [
      "https://highereducation.nagaland.gov.in/nagaland-scholarship-nodal-cell-nsnc/",
    ],
    applicationUrl: NSP,
    reviewedOn,
    deadline: null,
    rules: [
      rule("indianCitizen", "eq", true, "Indian citizenship"),
      rule("annualIncome", "max", 800000, "Annual family income up to ₹8 lakh"),
      rule(
        "course",
        "in",
        ["technical_degree", "technical_diploma"],
        "Technical degree or diploma",
      ),
      rule(
        "institutionApproved",
        "eq",
        true,
        "AICTE-approved institution/course",
      ),
      rule(
        "entry",
        "in",
        ["first_year", "lateral_second"],
        "First year, or second year through lateral entry",
      ),
      rule("disabilityPercent", "min", 40, "Disability of at least 40%"),
    ],
    documents: [
      ...common,
      "Valid disability certificate/UDID as required by the scheme",
    ],
    confirm: [
      "Current AICTE guidelines, assistance overlap rules and entry-year conditions",
      "Disability documentation and current application window",
    ],
    sourceNote:
      "Income and benefit details are from the state technical education page; verify against current AICTE rules.",
  },
  {
    id: "inspire-she",
    title: "INSPIRE Scholarship for Higher Education",
    provider: "Department of Science & Technology",
    category: "Basic sciences",
    support:
      "Science scholarship and mentorship support; check the latest call for amounts.",
    summary:
      "For meritorious students pursuing eligible basic and natural science degrees.",
    officialUrl: "https://www.online-inspire.gov.in/Account/FAQ",
    applicationUrl: "https://www.online-inspire.gov.in/",
    reviewedOn,
    deadline: null,
    rules: [
      rule("indianCitizen", "eq", true, "Indian citizenship"),
      rule("age", "min", 17, "Age at least 17"),
      rule("age", "max", 22, "Age at most 22"),
      rule(
        "course",
        "eq",
        "basic_science",
        "Eligible basic/natural science degree",
      ),
      rule("regularCourse", "eq", true, "Regular study"),
    ],
    documents: [
      "Class XII marksheet and board eligibility evidence",
      "Admission proof for an eligible science course",
      "Documents specified in the current INSPIRE call",
    ],
    confirm: [
      "Top-1% board merit or another official merit route is required; this checker does not decide those routes",
      "Exact subject eligibility, admission year and current call",
    ],
    sourceNote:
      "Engineering, medicine and other professional courses are not covered by this science-degree screening.",
  },
  {
    id: "post-matric-disability",
    title: "Post-Matric Scholarship — Students with Disabilities",
    provider: "Department of Empowerment of Persons with Disabilities",
    category: "Disability support",
    support: "Fee and maintenance support varies by course and circumstances.",
    summary:
      "Post-matric education support for eligible Indian students with benchmark disabilities.",
    officialUrl: "https://depwd.gov.in/en/scholarship-post-matric/",
    applicationUrl: NSP,
    reviewedOn,
    deadline: null,
    rules: [
      rule("indianCitizen", "eq", true, "Indian citizenship"),
      rule(
        "annualIncome",
        "max",
        250000,
        "Annual family income up to ₹2.5 lakh",
      ),
      rule("disabilityPercent", "min", 40, "Disability of at least 40%"),
      rule("udid", "eq", true, "UDID documentation"),
      rule(
        "otherScholarship",
        "eq",
        false,
        "No other post-matric scholarship/stipend",
      ),
    ],
    documents: [...common, "UDID and disability documentation"],
    confirm: [
      "Course coverage, family limits and current scheme guidelines",
      "Current application window and required official documents",
    ],
    sourceNote:
      "Keep identity and banking details on the official application portal, not in GigGrad.",
  },
];
module.exports = { scholarships, NSP };
