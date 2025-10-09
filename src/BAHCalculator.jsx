// PATH: src/BAHCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * BAH Calculator (Military-focused)
 *
 * Purpose:
 * - Estimate monthly housing budget using BAH/BAS and taxable base pay.
 * - Show tax-aware take-home context by state. BAH/BAS are non-taxable.
 * - Split recommended housing payment into P&I vs. escrows target.
 *
 * Notes:
 * - BAH varies by ZIP, paygrade, and with/without dependents. This tool
 *   lets the user enter BAH directly or estimate with a quick rule.
 * - State tax rates are pulled from stateTaxAndBenefits.js when available
 *   and used only on taxable income (not on BAH/BAS).
 */

function n(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}
function pct(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v / 100 : 0;
}
function money(x) {
  return `$${Math.round(n(x)).toLocaleString()}`;
}

export default function BAHCalculator() {
  // State + context
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  // Pay + allowances (monthly)
  const [taxableBasePay, setTaxableBasePay] = useState(6500); // taxable
  const [bahMonthly, setBahMonthly] = useState(2400); // non-taxable
  const [basMonthly, setBasMonthly] = useState(450); // non-taxable
  const [otherTaxable, setOtherTaxable] = useState(0);
  const [otherNonTaxable, setOtherNonTaxable] = useState(0);

  // Estimation helper (optional)
  const [useQuickEstimate, setUseQuickEstimate] = useState(false);
  const [zip, setZip] = useState("");
  const [paygrade, setPaygrade] = useState("O-3");
  const [hasDependents, setHasDependents] = useState(true);

  // Housing targets
  const [frontEndPct, setFrontEndPct] = useState(28); // housing share of qualifying income
  const [escrowPctOfPITI, setEscrowPctOfPITI] = useState(28); // share of PITI reserved for taxes+insurance+hoa

  // Gross-up display (lender context)
  const [grossUpPct, setGrossUpPct] = useState(25);

  // Pull state tax meta
  const stateMeta = getState(stateCode);
  const stateIncomeTaxRate =
    stateMeta?.tax?.income?.effectiveRatePct ?? 0; // % effective
  const stateSalesTaxRate = stateMeta?.tax?.sales?.stateRatePct ?? 0;

  // Derive incomes
  const taxableIncome = n(taxableBasePay) + n(otherTaxable);
  const nonTaxable = n(bahMonthly) + n(basMonthly) + n(otherNonTaxable);
  const grossUpFactor = 1 + pct(grossUpPct);
  const qualifyingIncome = taxableIncome + nonTaxable * grossUpFactor;

  // Net take-home (rough, state only; federal not modeled here)
  const estStateTaxMonthly = taxableIncome * (stateIncomeTaxRate / 100);
  const netAfterState = taxableIncome - estStateTaxMonthly + nonTaxable;

  // Recommended PITI from front-end target
  const maxPITI = Math.max(0, qualifyingIncome * pct(frontEndPct));

  // Split PITI into P&I vs Escrows
  const escrowsTarget = maxPITI * pct(escrowPctOfPITI);
  const piTarget = Math.max(0, maxPITI - escrowsTarget);

  // Optional quick estimation of BAH (rough heuristic if user lacks BAH)
  // Heuristic: baseline by paygrade tier and dependents, lightly adjusted by ZIP leading digit.
  function quickBAH(paygrade, dep, zipStr) {
    const tier =
      paygrade.startsWith("E-")
        ? "E"
        : paygrade.startsWith("W-")
        ? "W"
        : "O";
    const base = tier === "E" ? 1800 : tier === "W" ? 2300 : 2600;
    const depAdj = dep ? 1.12 : 1.0;
    const zipLead = zipStr?.trim()?.[0] ?? "0";
    const geoAdj = ["0", "1", "2"].includes(zipLead)
      ? 0.95
      : ["7", "8", "9"].includes(zipLead)
      ? 1.08
      : 1.0;
    return Math.round(base * depAdj * geoAdj);
  }

  const estimatedBAH = useQuickEstimate ? quickBAH(paygrade, hasDependents, zip) : bahMonthly;

  // Chart data
  const chartData = [
    { name: "Taxable Income", value: Math.round(taxableIncome) },
    { name: "Non-taxable (BAH/BAS/Other)", value: Math.round(nonTaxable) },
    { name: "Qualifying Income", value: Math.round(qualifyingIncome) },
    { name: "Max PITI (Front Target)", value: Math.round(maxPITI) },
    { name: "P&I Target", value: Math.round(piTarget) },
    { name: "Escrows Target", value: Math.round(escrowsTarget) }
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">💰 BAH Calculator</h1>
        <p className="text-sm text-gray-600">
          Calculates a tax-aware monthly housing budget. BAH/BAS are non-taxable. Front-end DTI target sets max PITI.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Policy */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Policy</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              State effective income tax is applied to taxable income only.
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">State Income Tax (est.)</span>
              <span className="font-semibold">{stateIncomeTaxRate ?? 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">State Sales Tax</span>
              <span className="font-semibold">{stateSalesTaxRate ?? 0}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Front-End Target (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={frontEndPct}
                min={20}
                max={40}
                step="0.5"
                onChange={(e) => setFrontEndPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Escrows Share of PITI (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={escrowPctOfPITI}
                min={10}
                max={50}
                step="1"
                onChange={(e) => setEscrowPctOfPITI(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Income */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Monthly Income</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">Taxable Base Pay</label>
            <input
              type="number"
              className="mt-1 w-full rounded-md border p-2"
              value={taxableBasePay}
              min={0}
              onChange={(e) => setTaxableBasePay(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {useQuickEstimate ? "BAH (estimated)" : "BAH (enter)"}
              </label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={useQuickEstimate ? estimatedBAH : bahMonthly}
                min={0}
                onChange={(e) => setBahMonthly(Number(e.target.value))}
                disabled={useQuickEstimate}
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  id="est"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={useQuickEstimate}
                  onChange={(e) => setUseQuickEstimate(e.target.checked)}
                />
                <label htmlFor="est" className="text-sm text-gray-700">
                  Quick estimate BAH
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">BAS (non-taxable)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={basMonthly}
                min={0}
                onChange={(e) => setBasMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          {useQuickEstimate && (
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP (for rough geo)</label>
                <input
                  type="text"
                  className="mt-1 w-full rounded-md border p-2"
                  value={zip}
                  maxLength={5}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Paygrade</label>
                <select
                  className="mt-1 w-full rounded-md border p-2 bg-white"
                  value={paygrade}
                  onChange={(e) => setPaygrade(e.target.value)}
                >
                  {["E-4", "E-6", "W-2", "O-1", "O-3", "O-5"].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={hasDependents}
                    onChange={(e) => setHasDependents(e.target.checked)}
                  />
                  With dependents
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Taxable</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={otherTaxable}
                min={0}
                onChange={(e) => setOtherTaxable(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Other Non-taxable</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={otherNonTaxable}
                min={0}
                onChange={(e) => setOtherNonTaxable(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Gross-up Non-taxable (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={grossUpPct}
                min={0}
                max={35}
                onChange={(e) => setGrossUpPct(Number(e.target.value))}
              />
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Qualifying Income</span>
                <span className="font-semibold">
                  {money(qualifyingIncome)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Net After State (approx)</span>
                <span className="font-semibold">{money(netAfterState)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Housing target */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Housing Budget</h2>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">Max PITI (front target)</span>
              <span className="font-semibold text-blue-900">
                {money(maxPITI)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">P&I Target</span>
              <span className="font-semibold text-blue-900">
                {money(piTarget)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Escrows Target</span>
              <span className="font-semibold text-blue-900">
                {money(escrowsTarget)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
            BAH and BAS do not incur federal income tax and are typically excluded from state income tax.
            This tool applies state tax only to taxable base pay and other taxable income.
          </div>
        </section>

        {/* Snapshot */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Snapshot</h2>
          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Taxable Income</span>
              <span className="font-semibold">{money(taxableIncome)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Non-taxable</span>
              <span className="font-semibold">{money(nonTaxable)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">State Tax (approx)</span>
              <span className="font-semibold">
                {money(estStateTaxMonthly)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Net After State</span>
              <span className="font-semibold">{money(netAfterState)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => money(v)} />
            <Legend />
            <Bar dataKey="value" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Enter actual BAH from official tables for accuracy. The quick estimate is a rough placeholder only.
          </li>
          <li>
            Front-end target is a guideline. AUS findings and lender overlays govern eligibility.
          </li>
          <li>
            BAH/BAS are non-taxable. State tax applies to taxable income only in this tool.
          </li>
        </ul>
      </footer>
    </div>
  );
}
