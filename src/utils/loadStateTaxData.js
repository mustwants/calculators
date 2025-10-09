// PATH: src/utils/loadStateTaxData.js
// Normalizes either shape:
// 1) default export is { states: { CA: {...}, ... }, ... }  (nested)
// 2) default export is { CA: {...}, ... }                   (flat)
import raw from "../data/stateTaxAndBenefits.js";

/**
 * Conventions:
 * - incomeTax, propertyTax are percent values (e.g., 5.75 means 5.75%).
 * - *_Taxed are booleans.
 */

const map =
  raw && typeof raw === "object"
    ? (raw.states && typeof raw.states === "object" ? raw.states : raw)
    : {};

const byName = Object.fromEntries(
  Object.entries(map).map(([code, s]) => [
    String(s?.name || code).toLowerCase(),
    { ...s, code },
  ])
);

export function listStateOptions() {
  return Object.entries(map)
    .map(([code, s]) => ({ code, name: s?.name || code }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getState(codeOrName) {
  if (!codeOrName) return null;
  const key = String(codeOrName).trim();
  if (map[key]) return { ...map[key], code: key };
  return byName[key.toLowerCase()] || null;
}

export function getStatesMap() {
  return map; // { "CA": {...}, ... }
}

// Optional metadata passthrough if present on nested shape
export function getMeta() {
  return {
    version: raw?.version ?? undefined,
    lastUpdated: raw?.lastUpdated ?? undefined,
  };
}

export default map;
