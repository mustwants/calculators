// src/utils/tax.js
import { getState } from "./loadStateTaxData";

/** Returns state income tax liability on a taxable amount. */
export function incomeTaxLiability(stateCodeOrName, taxableAmount) {
  const s = getState(stateCodeOrName);
  if (!s) return 0;
  const ratePct = Number(s.incomeTax ?? 0); // percent
  return Math.max(0, Number(taxableAmount || 0)) * (ratePct / 100);
}

/** Returns net after state income tax. */
export function afterStateIncomeTax(stateCodeOrName, amount) {
  return Math.max(0, Number(amount || 0)) - incomeTaxLiability(stateCodeOrName, amount);
}

/** Annual property tax from assessed value. */
export function propertyTaxAnnual(stateCodeOrName, assessedValue) {
  const s = getState(stateCodeOrName);
  if (!s) return 0;
  const ratePct = Number(s.propertyTax ?? 0); // percent
  return Math.max(0, Number(assessedValue || 0)) * (ratePct / 100);
}

/** Policy flags */
export function isSBPTaxed(stateCodeOrName) {
  const s = getState(stateCodeOrName);
  return s ? !!s.sbpTaxed : true;
}
export function isRetirementTaxed(stateCodeOrName) {
  const s = getState(stateCodeOrName);
  return s ? !!s.militaryRetirementTaxed : true;
}
export function isDisabilityTaxed(stateCodeOrName) {
  const s = getState(stateCodeOrName);
  return s ? !!s.disabilityTaxed : false;
}
