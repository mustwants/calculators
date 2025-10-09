// PATH: src/MortgageCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * Mortgage Calculator — VA-aware, state tax & insurance aware
 * - Supports VA and non-VA loans (funding fee logic, PMI on non-VA until 80% LTV).
 * - Auto-prefills property tax and rough homeowners insurance from state dataset.
 * - Breaks down monthly payment: P&I, tax, insurance, HOA, PMI.
 * - Amortization preview and total cost over horizon.
 * Planner only. Not advice.
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

export default function MortgageCalculator() {
  // State dataset for taxes/insurance defaults
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const stateMeta = getState(stateCode);

  const inferredPropTaxPct =
    stateMeta?.tax?.property?.effectiveRatePct ??
    stateMeta?.tax?.property?.notes?.defaultRatePct ??
    1.0;

  // Heuristic insurance default by state (editable)
  const inferredInsPct =
    stateMeta?.tax?.property?.notes?.insurancePct ??
    0.35; // % of home value per year

  // Inputs
  const [price, setPrice] = useState(450_000);
  const [downPct, setDownPct] = useState(0); // keep 0 for VA by default
  const [isVA, setIsVA] = useState(true);
  const [firstUse, setFirstUse] = useState(true);
  const [financeFundingFee, setFinanceFundingFee] = useState(true);

  const [ratePct, setRatePct] = useState(6.25);
  const [termYears, setTermYears] = useState(30);
  const [pointsPct, setPointsPct] = useState(0); // optional discount points
  const [originationPct, setOriginationPct] = useState(1.0); // lender+title estimate
  const [hoaMonthly, setHoaMonthly] = useState(0);

  const [propTaxPct, setPropTaxPct] = useState(inferredPropTaxPct);
  const [insPct, setInsPct] = useState(inferredInsPct);

  // PMI settings for non-VA
  const [pmiAnnualPct, setPmiAnnualPct] = useState(0.6);

  // Functions
  function vaFundingFeeRate(downP, first) {
    // Simplified 2024+ table
    if (downP >= 10) return 1.25;
    if (downP >= 5) return 1.50;
    return first ? 2.15 : 3.30;
  }

  // Loan amounts
  const down = isVA ? 0 : price * pct(downPct);
  const baseLoan = Math.max(0, price - down);
  const ffRate = isVA ? vaFundingFeeRate(downPct, firstUse) : 0;
  const fundingFee = isVA ? baseLoan * pct(ffRate) : 0;
  const loanAmount = isVA
    ? financeFundingFee
      ? baseLoan + fundingFee
      : baseLoan
    : baseLoan;

  // Pricing adjustments
  const pointsCost = price * pct(pointsPct);
  const originationCost = price * pct(originationPct);

  // Mortgage payment
  const r = pct(ratePct) / 12;
  const nper = termYears * 12;
  const monthlyPI = r === 0 ? loanAmount / nper : (loanAmount * r) / (1 - Math.pow(1 + r, -nper));

  // Taxes, insurance
  const taxMonthly = (price * pct(propTaxPct)) / 12;
  const insMonthly = (price * pct(insPct)) / 12;

  // PMI (non-VA, until LTV <= 80%)
  const pmiStartMonthly = !isVA && loanAmount / price > 0.8 ? (loanAmount * pct(pmiAnnualPct)) / 12 : 0;

  // Build an amortization preview and detect PMI cutoff
  const previewYears = Math.min(10, termYears); // limit chart volume
  const previewMonths = previewYears * 12;
  let bal = loanAmount;
  let pmiActive = pmiStartMonthly > 0;
  let pmiCutoffMonth = null;

  const line = [];
  for (let m = 1; m <= previewMonths; m++) {
    const interest = bal * r;
    const principal = Math.min(bal, monthlyPI - interest);
    bal = Math.max(0, bal - principal);

    // PMI cutoff check by current LTV vs original value
    if (pmiActive && bal / price <= 0.80) {
      pmiActive = false;
      pmiCutoffMonth = m;
    }

    const pmi = pmiActive ? pmiStartMonthly : 0;
    const piti = monthlyPI + taxMonthly + insMonthly + pmi + hoaMonthly;

    if (m % 12 === 0 || m === previewMonths) {
      line.push({
        month: m,
        year: m / 12,
        Balance: Math.round(bal),
        PrincipalYTD: Math.round((monthlyPI - interest) + 0), // last month principal
        PITI: Math.round(piti),
      });
    }
  }

  // Current monthly snapshot
  const currentPMIActive = pmiStartMonthly > 0; // initial month
  const monthlyPaymentNow = monthlyPI + taxMonthly + insMonthly + (currentPMIActive ? pmiStartMonthly : 0) + hoaMonthly;

  // Cost summary at close
  const cashAtClose =
    (isVA ? 0 : down) + (financeFundingFee ? 0 : fundingFee) + pointsCost + originationCost;

  // Chart bars
  const bars = [
    { name: "Principal & Interest", value: monthlyPI },
    { name: "Property tax", value: taxMonthly },
    { name: "Insurance", value: insMonthly },
    { name: "PMI", value: currentPMIActive ? pmiStartMonthly : 0 },
    { name: "HOA", value: hoaMonthly },
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏠 Mortgage Calculator</h1>
        <p className="text-sm text-gray-600">
          VA-aware payment breakdown with state-based taxes and insurance. Amortization preview included.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Taxes */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Taxes</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => {
                const code = e.target.value;
                setStateCode(code);
                const meta = getState(code);
                const nextTax =
                  meta?.tax?.property?.effectiveRatePct ??
                  meta?.tax?.property?.notes?.defaultRatePct ??
                  propTaxPct;
                const nextIns =
                  meta?.tax?.property?.notes?.insurancePct ?? insPct;
                setPropTaxPct(Number(nextTax));
                setInsPct(Number(nextIns));
              }}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Property tax (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={propTaxPct}
                min={0}
                max={5}
                step="0.05"
                onChange={(e) => setPropTaxPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance (%/yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={insPct}
                min={0}
                max={2}
                step="0.05"
                onChange={(e) => setInsPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Tax monthly</span>
              <span className="font-semibold">{money(taxMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Insurance monthly</span>
              <span className="font-semibold">{money(insMonthly)}</span>
            </div>
          </div>
        </section>

        {/* Price & Loan */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Price & Loan</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Home price ($)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={price}
                min={50_000}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input
                id="isva"
                type="checkbox"
                className="h-4 w-4"
                checked={isVA}
                onChange={(e) => {
                  setIsVA(e.target.checked);
                  if (e.target.checked) setDownPct(0);
                }}
              />
              <label htmlFor="isva" className="text-sm text-gray-700">
                VA loan
              </label>
            </div>
          </div>

          {!isVA && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Down payment (%)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={downPct}
                min={0}
                max={100}
                step="0.5"
                onChange={(e) => setDownPct(Number(e.target.value))}
              />
            </div>
          )}

          {isVA && (
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  id="firstuse"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={firstUse}
                  onChange={(e) => setFirstUse(e.target.checked)}
                />
                <label htmlFor="firstuse" className="text-sm text-gray-700">
                  First-use funding fee
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="financeff"
                  type="checkbox"
                  className="h-4 w-4"
                  checked={financeFundingFee}
                  onChange={(e) => setFinanceFundingFee(e.target.checked)}
                />
                <label htmlFor="financeff" className="text-sm text-gray-700">
                  Finance funding fee
                </label>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Funding fee rate</span>
              <span className="font-semibold">{ffRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Funding fee</span>
              <span className="font-semibold">{money(fundingFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Base loan</span>
              <span className="font-semibold">{money(baseLoan)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Final loan amount</span>
              <span className="font-semibold">{money(loanAmount)}</span>
            </div>
          </div>
        </section>

        {/* Rate & Costs */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rate & Costs</h2>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (APR %)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={ratePct}
                min={0}
                max={15}
                step="0.01"
                onChange={(e) => setRatePct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Term (years)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={termYears}
                min={5}
                max={40}
                onChange={(e) => setTermYears(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">HOA ($/mo)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={hoaMonthly}
                min={0}
                onChange={(e) => setHoaMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          {!isVA && (
            <div>
              <label className="block text-sm font-medium text-gray-700">PMI (% of loan / yr)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={pmiAnnualPct}
                min={0}
                max={2}
                step="0.05"
                onChange={(e) => setPmiAnnualPct(Number(e.target.value))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Discount points (% of price)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={pointsPct}
                min={0}
                max={5}
                step="0.125"
                onChange={(e) => setPointsPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Origination & title (% of price)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={originationPct}
                min={0}
                max={5}
                step="0.25"
                onChange={(e) => setOriginationPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-700">Points cost</span>
              <span className="font-semibold">{money(pointsCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Origination/title</span>
              <span className="font-semibold">{money(originationCost)}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-700">Cash at close</span>
              <span className="font-semibold">{money(cashAtClose)}</span>
            </div>
          </div>
        </section>

        {/* Monthly Summary */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Monthly Summary</h2>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-blue-900">Principal & interest</span>
              <span className="font-semibold text-blue-900">{money(monthlyPI)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Property tax</span>
              <span className="font-semibold text-blue-900">{money(taxMonthly)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-900">Insurance</span>
              <span className="font-semibold text-blue-900">{money(insMonthly)}</span>
            </div>
            {!isVA && pmiStartMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-900">PMI (until 80% LTV)</span>
                <span className="font-semibold text-blue-900">{money(pmiStartMonthly)}</span>
              </div>
            )}
            {hoaMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-blue-900">HOA</span>
                <span className="font-semibold text-blue-900">{money(hoaMonthly)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="text-blue-900">Estimated monthly payment</span>
              <span className="font-semibold text-blue-900">{money(monthlyPaymentNow)}</span>
            </div>
          </div>

          {!isVA && pmiStartMonthly > 0 && (
            <p className="text-xs text-gray-600">
              PMI auto-estimated to drop when LTV reaches 80%.
              {pmiCutoffMonth ? ` Preview cutoff ≈ month ${pmiCutoffMonth}.` : ""}
            </p>
          )}
        </section>
      </div>

      {/* Payment breakdown */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bars}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => money(v)} />
            <Legend />
            <Bar dataKey="value" name="Monthly amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Amortization preview */}
      <div className="mt-6 h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={line}>
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip
              formatter={(v, n) => [money(v), n]}
              labelFormatter={(y) => `Year ${y}`}
            />
            <Legend />
            <Line type="monotone" dataKey="Balance" dot={false} />
            <Line type="monotone" dataKey="PITI" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>State defaults for taxes and insurance are editable and approximate.</li>
          <li>VA funding fee varies by use and down payment; tool uses a simplified table.</li>
          <li>Actual PMI rules and cancellation can vary by investor and servicer.</li>
        </ul>
      </footer>
    </div>
  );
}
