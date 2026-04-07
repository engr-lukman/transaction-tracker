export function sanitizeTitle(title) {
  if (typeof title !== "string") {
    return "";
  }
  return title.trim();
}

export function toPositiveNumber(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : NaN;
}
