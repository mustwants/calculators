// PATH: src/PropertyTaxCalculator.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { listStateOptions, getState } from "./utils/loadStateTaxData";

/**
 * Property Tax Calculator — Military & Veteran aware
 * - Prefills effective property tax rate by state from dataset.
 * - Models homestead / veteran disability exemptions as $ value off assessed value.
 * - Supports assessment ratio, mill rate override, and monthly escrow estimate.
 * - Visuals: annual tax over horizon with appreciation, and monthly escrow vs other costs.
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
function money(v) {
  return `$${Math.round(n(v)).toLocaleString()}`;
}

export default function PropertyTaxCalculator() {
  // State dataset
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");
  const smeta = getState(stateCode);

  const inferredRatePct =
    smeta?.tax?.property?.effectiveRatePct ??
    smeta?.tax?.property?.notes?.defaultRatePct ??
    1.0;

  const defaultVetExemption =
    smeta?.benefits?.propertyTaxRelief?.veteranExemptionDollars ?? 0;

  // Inputs
  const [homeValue, setHomeValue] = useState(450_000);
  const [assessRatioPct, setAssessRatioPct] = useState(
    smeta?.tax?.property?.assessmentRatioPct ?? 100
  ); // some states assess <100% of MV
  const [taxRatePct, setTaxRatePct] = useState(inferredRatePct); // effective rate % of MV per year
  const [veteranExemption, setVeteranExemption] = useState(defaultVetExemption); // $ off assessed value
  const [disabilityExemption, setDisabilityExemption] = useState(0); // additional $ off
  const [localAddlRatePct, setLocalAddlRatePct] = useState(0); // add-on local special district %
  const [hoaMonthly, setHoaMonthly] = useState(0); // for escrow view only

  const [years, setYears] = useState(10);
  const [appreciationPct, setAppreciationPct] = useState(3.0);

  // Derived
  const assessedBase = homeValue * pct(assessRatioPct);
  const exemptions = Math.min(assessedBase, veteranExemption + disabilityExemption);
  const assessedAfterExempt = Math.max(0, assessedBase - exemptions);

  const effectiveRate = pct(taxRatePct + localAddlRatePct);
  const annualTaxNow = assessedAfterExempt * effectiveRate;
  const monthlyEscrowNow = annualTaxNow / 12;

  // Horizon projection
  const mApp = Math.pow(1 + pct(appreciationPct), 1 / 12) - 1;
  let mv = homeValue;

  const proj = [];
  for (let y = 1; y <= years; y++) {
    // grow monthly then sample annually
    for (let m = 0; m < 12; m++) mv *= 1 + mApp;

    const assessedY = mv * pct(assessRatioPct);
    const exemptionsY = Math.min(assessedY, exemptions); // keep exemption in nominal $
    const assessedAfterY = Math.max(0, assessedY - exemptionsY);
    const annualTaxY = assessedAfterY * effectiveRate;

    proj.push({
      year: y,
      "Annual tax": Math.round(annualTaxY),
      "Monthly escrow": Math.round(annualTaxY / 12),
    });
  }

  // Escrow composition snapshot
  const escrowBars = [
    { name: "Property tax (mo)", value: monthlyEscrowNow },
    { name: "HOA (mo)", value: hoaMonthly },
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">📊 Property Tax Calculator</h1>
        <p className="text-sm text-gray-600">
          Prefills state-effective rates. Apply veteran and disability exemptions. Shows annual tax over time and monthly escrow.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* State & Assessment */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">State & Assessment</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => {
                const code = e.target.value;
                setStateCode(code);
                const meta = getState(code);
                const nextRate =
                  meta?.tax?.property?.effectiveRatePct ??
                  meta?.tax?.property?.notes?.defaultRatePct ??
                  taxRatePct;
                const nextAssess = meta?.tax?.property?.assessmentRatioPct ?? assessRatioPct;
                const nextVet = meta?.benefits?.propertyTaxRelief?.veteranExemptionDollars ?? veteranExemption;
                setTaxRatePct(Number(nextRate));
                setAssessRatioPct(Number(nextAssess));
                setVeteranExemption(Number(nextVet));
              }}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <NumberField
            label="Assessment ratio (% of market value)"
            value={assessRatioPct}
            setValue={setAssessRatioPct}
            min={1}
            max={100}
            step={1}
          />

          <NumberField
            label="Effective tax rate (%/yr)"
            value={taxRatePct}
            setValue={setTaxRatePct}
            min={0}
            max={5}
            step={0.05}
          />

          <NumberField
            label="Local add-on rate (%/yr)"
            value={localAddlRatePct}
            setValue={setLocalAddlRatePct}
            min={0}
            max={3}
            step={0.05}
          />
        </section>

        {/* Home & Exemptions */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Home & Exemptions</h2>

          <NumberField label="Market value ($)" value={homeValue} setValue={setHomeValue} min={10_000} step={1_000} />

          <NumberField
            label="Veteran exemption ($)"
            value={veteranExemption}
            setValue={setVeteranExemption}
            min={0}
            step={1_000}
          />

          <NumberField
            label="Disability exemption ($)"
            value={disabilityExemption}
            setValue={setDisabilityExemption}
            min={0}
            step={1_000}
          />

          <NumberField label="HOA ($/mo)" value={hoaMonthly} setValue={setHoaMonthly} min={0} step={10} />

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <Row label="Assessed base" value={money(assessedBase)} />
            <Row label="Total exemptions" value={money(exemptions)} />
            <Row label="Assessed after exemptions" value={money(assessedAfterExempt)} />
          </div>
        </section>

        {/* Horizon */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Horizon</h2>

          <NumberField
            label="Projection years"
            value={years}
            setValue={setYears}
            min={1}
            max={30}
            step={1}
          />

          <NumberField
            label="Appreciation (%/yr)"
            value={appreciationPct}
            setValue={setAppreciationPct}
            min={-5}
            max={10}
            step={0.25}
          />

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <Row label="Annual tax (now)" value={money(annualTaxNow)} bold />
            <Row label="Monthly escrow (now)" value={money(monthlyEscrowNow)} bold />
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-gray-800">Summary</h2>
          <p className="text-sm text-gray-600">
            Uses state-effective rate and assessment rules where available. Exemptions reduce assessed value before tax.
          </p>
          <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
            <li>Effective rate = state rate + local add-on.</li>
            <li>Escrow approximation = annual tax / 12.</li>
            <li>Exemptions treated as flat-dollar reductions.</li>
          </ul>
        </section>
      </div>

      {/* Charts */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="h-80 w-full bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Annual Property Tax Projection</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={proj}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(v, n) => [money(v), n]} labelFormatter={(y) => `Year ${y}`} />
              <Legend />
              <Area type="monotone" dataKey="Annual tax" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 w-full bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Monthly Escrow View</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={escrowBars}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="value" name="Monthly amount" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function NumberField({ label, value, setValue, min = 0, max, step = 1 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        className="mt-1 w-full rounded-md border p-2"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
}

function Row({ label, value, bold = false }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-700">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
