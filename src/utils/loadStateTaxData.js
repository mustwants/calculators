// src/utils/loadStateTaxData.js
import stateData from "../data/stateTaxAndBenefits.json";

/**
 * stateTaxAndBenefits.json conventions:
 * - incomeTax, propertyTax are expressed in percent (e.g., 5.75 means 5.75%)
 * - *_Taxed are booleans
 */

const byCode = stateData.states;
const byName = Object.fromEntries(
  Object.entries(byCode).map(([code, s]) => [s.name.toLowerCase(), { ...s, code }])
);

export function listStateOptions() {
  return Object.entries(byCode)
    .map(([code, s]) => ({ code, name: s.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getState(codeOrName) {
  if (!codeOrName) return null;
  const key = String(codeOrName).trim();
  if (byCode[key]) return { ...byCode[key], code: key };
  const byLower = byName[key.toLowerCase()];
  return byLower || null;
}

export function getStatesMap() {
  return byCode; // raw map { "CA": {...}, ... }
}

export default stateData;

