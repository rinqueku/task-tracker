export function requireFields(obj, fields) {
  const missing = fields.filter((f) => !obj[f] || !String(obj[f]).trim());
  if (missing.length) {
    return `Missing required fields: ${missing.join(", ")}`;
  }
  return null;
}

export function isValidStatus(value) {
  return ["pending", "in_progress", "completed"].includes(value);
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}