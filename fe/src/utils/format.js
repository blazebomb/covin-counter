// Format numbers for display. Return a dash when the value is absent or not numeric.
export const formatNumber = (value, empty = "--") => {
  if (value === null || value === undefined || value === "") return empty;
  const num = Number(value);
  if (!Number.isFinite(num)) return empty;
  return num.toLocaleString("en-US");
};
