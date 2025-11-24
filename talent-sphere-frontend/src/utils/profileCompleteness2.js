const REGISTER_FORM_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "password",
  "confirmPassword",
  "phone",
  "currentTitle",
  "currentCompany",
  "yearsOfExperience",
  "location.city",
  "location.state",
  "location.country",
  "location.remote",
  "skills",
  "education",
  "experience",
];

function getValueAtPath(obj, path) {
  if (!obj) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur === undefined || cur === null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export function computeCompleteness(profile) {
  if (!profile) return 0;

  let filled = 0;

  for (const path of REGISTER_FORM_FIELDS) {
    const val = getValueAtPath(profile, path);

    if (path === "password" || path === "confirmPassword") {
      continue;
    }

    if (path === "skills" || path === "education" || path === "experience") {
      if (Array.isArray(val) && val.length > 0) {
        filled++;
      }
      continue;
    }

    if (typeof val === "string") {
      if (val.trim().length > 0) filled++;
      continue;
    }

    if (typeof val === "number") {
      filled++;
      continue;
    }

    if (typeof val === "boolean") {
      filled++;
      continue;
    }
  }

  const denominator = REGISTER_FORM_FIELDS.filter(
    (p) => p !== "password" && p !== "confirmPassword"
  ).length;

  const pct = Math.round((filled / denominator) * 100);
  return Math.min(100, Math.max(0, pct));
}

export const REGISTER_FORM_FIELD_COUNT = REGISTER_FORM_FIELDS.length;

export default {
  computeCompleteness,
  REGISTER_FORM_FIELD_COUNT,
};
