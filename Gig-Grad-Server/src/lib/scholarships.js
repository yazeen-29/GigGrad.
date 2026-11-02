const { fail } = require("./validation");
const fields = {
  indianCitizen: "boolean",
  annualIncome: [0, 100000000],
  boardPercentile: [0, 100],
  age: [14, 100],
  disabilityPercent: [0, 100],
  gender: ["female", "male", "other"],
  course: [
    "general_degree",
    "technical_degree",
    "technical_diploma",
    "basic_science",
    "postgraduate",
    "school",
    "other",
  ],
  entry: ["first_year", "lateral_second", "other"],
  regularCourse: "boolean",
  institutionApproved: "boolean",
  otherScholarship: "boolean",
  gapAfter12: "boolean",
  udid: "boolean",
};
function validateProfile(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    fail("Provide an eligibility profile");
  const output = {};
  for (const [key, type] of Object.entries(fields)) {
    const value = input[key];
    if (value === undefined || value === null || value === "") continue;
    if (type === "boolean") {
      if (typeof value !== "boolean") fail(`Invalid ${key}`);
    } else if (typeof type[0] === "number") {
      if (
        typeof value !== "number" ||
        !Number.isFinite(value) ||
        value < type[0] ||
        value > type[1]
      )
        fail(`Invalid ${key}`);
    } else if (!type.includes(value)) fail(`Invalid ${key}`);
    output[key] = value;
  }
  return output;
}
function assess(scholarship, profile) {
  const checks = scholarship.rules.map((rule) => {
    const value = profile[rule.field];
    if (value === undefined || value === null)
      return { label: rule.label, field: rule.field, status: "unknown" };
    const matches =
      rule.operator === "eq"
        ? value === rule.value
        : rule.operator === "in"
          ? rule.value.includes(value)
          : rule.operator === "max"
            ? value <= rule.value
            : rule.operator === "min"
              ? value >= rule.value
              : rule.operator === "gt"
                ? value > rule.value
                : value < rule.value;
    return {
      label: rule.label,
      field: rule.field,
      status: matches ? "pass" : "fail",
    };
  });
  return {
    scholarshipId: scholarship.id,
    outcome: checks.some((check) => check.status === "fail")
      ? "does_not_match"
      : checks.some((check) => check.status === "unknown")
        ? "needs_details"
        : "potential_match",
    checks,
    stillToConfirm: scholarship.confirm,
  };
}
module.exports = { validateProfile, assess };
