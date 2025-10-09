// PATH: src/LandlordProfitabilityTool.jsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { getState } from "./utils/loadStateTaxData.js";

/**
 * Landlord Profitability Tool — Military/Veteran aware
 * - Computes NOI, Cap Rate, Cash-on-Cash, DSCR, After-Tax Cash Flow.
 * - Integrates state tax baseline (income tax %) for after-tax estimate.
 * - Models depreciation (27.5y), vacancy, maintenance, PM, HOA, insurance, taxes, utilities.
 * - Supports VA owner-occupied → later convert to rental (delay months).
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

export default function LandlordProfitabilityTool() {
  // Location + tax baseline
  const [stateCode, setStateCode] = useState("VA");
  const smeta = getState(stateCode);
  const baselineStateIncomeTaxPct = smeta?.incomeTax ?? 0;

  // Purchase & Loan
  const [price, setPrice] = useState(425_000);
  const [downPct, setDownPct] = useState(15);
  const [ratePct, setRatePct] = useState(6.75);
  const [termYears, setTermYears] = useState(30);
  const [closingCosts, setClosingCosts] = useState(6_500);

  // Rent & Ops
  const [rentMonthly, setRentMonthly] = useState(2_800);
  const [otherIncome, setOtherIncome] = useState(0); // parking, storage
  const [vacancyPct, setVacancyPct] = useState(5);
  const [maintenancePct, setMaintenancePct] = useState(8);
  const [pmPct, setPmPct] = useState(8); // property management
  const [hoaMonthly, setHoaMonthly] = useState(0);
  const [insuranceMonthly, setInsuranceMonthly] = useState(95);
  const [utilitiesMonthly, setUtilitiesMonthly] = useState(0);

  // Taxes
  const [annualPropertyTaxPct, setAnnualPropertyTaxPct] = useState(
    smeta?.propertyTax ?? 0.85
  ); // % of market value per year

  // Income taxes
  const [fedMarginalPct, setFedMarginalPct] = useState(22);
  const [stateMarginalPct, setStateMarginalPct] = useState(baselineStateIncomeTaxPct);
  const [takesDepreciation, setTakesDepreciation] = useState(true);

  // Conversion timing (months before it becomes a rental)
  const [monthsUntilRental, setMonthsUntilRental] = useState(0);

  // Derived loan
  const down = price * pct(downPct);
  const loan = Math.max(0, price - down);
  const r = pct(ratePct) / 12;
  const nper = termYears * 12;
  const PI = r === 0 ? loan / nper : (loan * r) / (1 - Math.pow(1 + r, -nper));

  // Gross scheduled income
  const grossRentAnnual = rentMonthly * 12;
  const otherAnnual = otherIncome * 12;
  const vacancyLoss = grossRentAnnual * pct(vacancyPct);
  const egI = grossRentAnnual + otherAnnual - vacancyLoss; // Effective Gross Income

  // Operating expenses (excl. debt service)
  const pmAnnual = rentMonthly * 12 * pct(pmPct);
  const maintAnnual = rentMonthly * 12 * pct(maintenancePct);
  const hoaAnnual = hoaMonthly * 12;
  const insAnnual = insuranceMonthly * 12;
  const utilAnnual = utilitiesMonthly * 12;
  const propTaxAnnual = price * pct(annualPropertyTaxPct);

  const opEx = pmAnnual + maintAnnual + hoaAnnual + insAnnual + utilAnnual + propTaxAnnual;
  const NOI = egI - opEx;

  // Debt service
  const debtServiceAnnual = PI * 12;

  // Basic metrics
  const capRate = price > 0 ? (NOI / price) * 100 : 0;
  const cashInvested = down + closingCosts;
  const cashFlowBT = NOI - debtServiceAnnual; // before income taxes
  const coc = cashInvested > 0 ? (cashFlowBT / cashInvested) * 100 : 0;
  const dscr = debtServiceAnnual > 0 ? NOI / debtServiceAnnual : 0;

  // Depreciation & After-tax cash flow
  const buildingRatio = 0.82; // conservative land split
  const depreciableBasis = price * buildingRatio + closingCosts;
  const annualDepreciation = takesDepreciation ? depreciableBasis / 27.5 : 0;

  // Taxable income = NOI - interest - depreciation.
  // Approx interest portion in year 1:
  const interestApprox = loan * (pct(ratePct)); // year-1 rough
  const taxableIncome = Math.max(0, NOI - Math.max(0, interestApprox) - annualDepreciation);

  const totalMarginalRate = pct(fedMarginalPct + stateMarginalPct);
  const estIncomeTax = taxableIncome * totalMarginalRate;
  const cashFlowAT = cashFlowBT - estIncomeTax;

  // Convert-to-rental timing preview (first-year prorate)
  const rentalMonths = Math.max(0, 12 - n(monthsUntilRental));
  const firstYearAT = cashFlowAT * (rentalMonths / 12);

  // Trend data (simple sensitivities on rent +/-10% and rate +/-1%)
  const trends = useMemo(() => {
    const points = [];
    const rentVariants = [-10, -5, 0, 5, 10];
    for (const dv of rentVariants) {
      const rm = rentMonthly * (1 + dv / 100);
      const gsa = rm * 12 + otherAnnual - (rm * 12) * pct(vacancyPct);
      const pm = rm * 12 * pct(pmPct);
      const noi = gsa - (opEx - pmAnnual) - pm; // replace PM portion with new rent
      const cfbt = noi - debtServiceAnnual;
      const ti = Math.max(0, noi - Math.max(0, interestApprox) - annualDepreciation);
      const tax = ti * totalMarginalRate;
      const cfat = cfbt - tax;
      points.push({ label: `${dv}% rent`, "After-tax CF": Math.round(cfat) });
    }
    return points;
  }, [
    rentMonthly,
    otherAnnual,
    vacancyPct,
    pmPct,
    opEx,
    pmAnnual,
    debtServiceAnnual,
    interestApprox,
    annualDepreciation,
    totalMarginalRate,
  ]);

  const summary = [
    { name: "Cap Rate", value: `${capRate.toFixed(2)}%` },
    { name: "Cash-on-Cash", value: `${coc.toFixed(2)}%` },
    { name: "DSCR", value: dscr.toFixed(2) },
    { name: "NOI (yr 1)", value: money(NOI) },
    { name: "Debt Service (yr 1)", value: money(debtServiceAnnual) },
    { name: "Cash Flow BT (yr 1)", value: money(cashFlowBT) },
    { name: "Taxable Income (yr 1)", value: money(taxableIncome) },
    { name: "Est. Tax (yr 1)", value: money(estIncomeTax) },
    { name: "Cash Flow AT (yr 1)", value: money(cashFlowAT) },
    { name: "First-Year AT (prorated)", value: money(firstYearAT) },
  ];

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏠 Landlord Profitability</h1>
        <p className="text-sm text-gray-600">
          Calculates NOI, Cap Rate, Cash-on-Cash, DSCR, and after-tax cash flow with state income tax baseline.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Location & Taxes */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Location & Taxes</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={stateCode}
              onChange={(e) => {
                const code = e.target.value;
                setStateCode(code);
                const meta = getState(code);
                const nextProp = meta?.propertyTax ?? annualPropertyTaxPct;
                const nextStateInc = meta?.incomeTax ?? baselineStateIncomeTaxPct;
                setAnnualPropertyTaxPct(Number(nextProp));
                setStateMarginalPct(Number(nextStateInc));
              }}
            >
              {[
                "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <NumberField
            label="Property tax (% of value / yr)"
            value={annualPropertyTaxPct}
            setValue={setAnnualPropertyTaxPct}
            min={0}
            max={3}
            step={0.05}
          />

          <NumberField
            label="Federal marginal tax (%)"
            value={fedMarginalPct}
            setValue={setFedMarginalPct}
            min={0}
            max={37}
            step={1}
          />

          <NumberField
            label="State marginal tax (%)"
            value={stateMarginalPct}
            setValue={setStateMarginalPct}
            min={0}
            max={15}
            step={0.25}
          />

          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={takesDepreciation}
              onChange={(e) => (setTakesDepreciation(e.target.checked))}
              className="h-4 w-4 text-blue-600 rounded"
            />
            Take residential depreciation (27.5 years)
          </label>
        </section>

        {/* Purchase & Loan */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Purchase & Loan</h2>

          <NumberField label="Purchase price ($)" value={price} setValue={setPrice} min={50_000} step={1_000} />
          <NumberField label="Down payment (%)" value={downPct} setValue={setDownPct} min={0} max={100} step={0.5} />
          <NumberField label="Rate (APR %)" value={ratePct} setValue={setRatePct} min={0} max={15} step={0.01} />
          <NumberField label="Term (years)" value={termYears} setValue={setTermYears} min={5} max={40} />
          <NumberField label="Closing costs ($)" value={closingCosts} setValue={setClosingCosts} min={0} step={500} />

          <div className="rounded-lg bg-gray-50 p-3 text-xs space-y-1">
            <Row label="Down payment" value={money(down)} />
            <Row label="Loan amount" value={money(loan)} />
            <Row label="P&I (monthly)" value={money(PI)} />
          </div>
        </section>

        {/* Rent & Operating */}
        <section className="rounded-xl border p-4 space-y-3">
          <h2 className="font-semibold text-gray-800">Rent & Operating</h2>

          <NumberField label="Rent ($/mo)" value={rentMonthly} setValue={setRentMonthly} min={0} step={25} />
          <NumberField label="Other income ($/mo)" value={otherIncome} setValue={setOtherIncome} min={0} step={10} />
          <NumberField label="Vacancy (%)" value={vacancyPct} setValue={setVacancyPct} min={0} max={25} step={0.5} />
          <NumberField label="Maintenance (% of rent)" value={maintenancePct} setValue={setMaintenancePct} min={0} max={25} step={0.5} />
          <NumberField label="Property mgmt (% of rent)" value={pmPct} setValue={setPmPct} min={0} max={20} step={0.5} />
          <NumberField label="HOA ($/mo)" value={hoaMonthly} setValue={setHoaMonthly} min={0} step={10} />
          <NumberField label="Insurance ($/mo)" value={insuranceMonthly} setValue={setInsuranceMonthly} min={0} step={5} />
          <NumberField label="Utilities ($/mo)" value={utilitiesMonthly} setValue={setUtilitiesMonthly} min={0} step={10} />

          <NumberField
            label="Months until rental (VA → rental)"
            value={monthsUntilRental}
            setValue={setMonthsUntilRental}
            min={0}
            max={12}
            step={1}
          />
        </section>

        {/* Summary */}
        <section className="rounded-xl border p-4 space-y-2">
          <h2 className="font-semibold text-gray-800">Summary</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            {summary.map((s) => (
              <li key={s.name} className="flex justify-between">
                <span>{s.name}</span>
                <span className="font-semibold">{s.value}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-gray-500 mt-2">
            State income tax defaulted to dataset baseline. Adjust as needed for your bracket.
          </p>
        </section>
      </div>

      {/* Charts */}
      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="h-80 w-full bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Before vs After-Tax Cash Flow</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart
              data={[
                { name: "Before-tax", value: Math.round(cashFlowBT) },
                { name: "After-tax", value: Math.round(cashFlowAT) },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Bar dataKey="value" name="Annual cash flow" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-80 w-full bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Rent Sensitivity (±10%) — After-Tax CF</h3>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={trends}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
              <Line type="monotone" dataKey="After-tax CF" dot />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        Estimates only. Consult local tax rules, lender, and CPA for final decisions.
      </footer>
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

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
