const REGISTER_FORM_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "currentTitle",
  "currentCompany",
  "yearsOfExperience",
  "location.city",
  "location.state",
  "location.remote",
  "skills",
  "resume",
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
  const total = REGISTER_FORM_FIELDS.length;

  for (const path of REGISTER_FORM_FIELDS) {
    const val = getValueAtPath(profile, path);

    if (path === "skills") {
      if (Array.isArray(val) && val.length > 0) {
        const validSkills = val.filter(
          (skill) => skill && (skill.skill || skill.name || skill.displayName)
        );
        if (validSkills.length > 0) filled++;
      }
      continue;
    }

    if (path === "resume") {
      if (val && (val.filename || val.originalName)) filled++;
      continue;
    }

    if (typeof val === "string") {
      if (val.trim().length > 0) filled++;
      continue;
    }

    if (typeof val === "number") {
      if (val >= 0) filled++;
      continue;
    }

    if (typeof val === "boolean") {
      filled++;
      continue;
    }
  }

  const pct = Math.round((filled / total) * 100);
  return Math.min(100, Math.max(0, pct));
}

export const REGISTER_FORM_FIELD_COUNT = REGISTER_FORM_FIELDS.length;

export default {
  computeCompleteness,
  REGISTER_FORM_FIELD_COUNT,
};
