// PATH: src/LandlordProfitabilityTool.jsx
import React, { useMemo, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { listStateOptions } from "./utils/loadStateTaxData";
import { propertyTaxAnnual, incomeTaxLiability } from "./utils/tax";

/**
 * Landlord Profitability Tool
 * - Uses state average property-tax rate.
 * - Computes NOI, Cap Rate, Debt Service, Cash Flow, Cash-on-Cash.
 * - Simple state after-tax cash flow: tax on taxable income = max(0, NOI − interest − depreciation).
 *   Depreciation = building_value / 27.5 years. Building_value = price * buildingPct.
 */

function pmt(ratePct, years, principal) {
  const r = (ratePct / 100) / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (r * principal) / (1 - Math.pow(1 + r, -n));
}

export default function LandlordProfitabilityTool() {
  // Location
  const states = useMemo(() => listStateOptions(), []);
  const [stateCode, setStateCode] = useState("VA");

  // Acquisition / financing
  const [price, setPrice] = useState(420000);
  const [downPct, setDownPct] = useState(10);
  const [ratePct, setRatePct] = useState(6.75);
  const [termYrs, setTermYrs] = useState(30);
  const [buildingPct, setBuildingPct] = useState(80); // percent of price considered building (depreciable)

  // Income
  const [rentMonthly, setRentMonthly] = useState(2500);
  const [vacancyPct, setVacancyPct] = useState(6);
  const [otherIncomeMonthly, setOtherIncomeMonthly] = useState(0); // parking, laundry, etc.

  // Operating expenses (monthly unless noted)
  const [insuranceMonthly, setInsuranceMonthly] = useState(125);
  const [repairsPct, setRepairsPct] = useState(8); // % of rent
  const [managementPct, setManagementPct] = useState(8); // % of rent
  const [utilitiesMonthly, setUtilitiesMonthly] = useState(0);
  const [hoaMonthly, setHoaMonthly] = useState(0);

  // Derived — financing
  const down = price * (downPct / 100);
  const loan = Math.max(0, price - down);
  const piMonthly = pmt(ratePct, termYrs, loan);
  const monthlyRate = (ratePct / 100) / 12;
  const firstMonthInterest = loan * monthlyRate; // rough average; acceptable for planning
  const annualDebtService = piMonthly * 12;

  // Taxes and fixed annuals
  const annualPropTax = propertyTaxAnnual(stateCode, price);
  const fixedAnnual = annualPropTax + (insuranceMonthly * 12) + (utilitiesMonthly * 12) + (hoaMonthly * 12);

  // Income annualized with vacancy
  const grossRentAnnual = rentMonthly * 12;
  const vacancyLoss = grossRentAnnual * (vacancyPct / 100);
  const otherIncomeAnnual = otherIncomeMonthly * 12;
  const egi = grossRentAnnual - vacancyLoss + otherIncomeAnnual; // Effective Gross Income

  // Variable expenses
  const repairsAnnual = grossRentAnnual * (repairsPct / 100);
  const managementAnnual = grossRentAnnual * (managementPct / 100);

  // NOI
  const operatingExpenses = fixedAnnual + repairsAnnual + managementAnnual;
  const noi = egi - operatingExpenses;

  // Returns
  const capRate = price > 0 ? (noi / price) * 100 : 0;
  const annualCashFlow = noi - annualDebtService;
  const coc = down > 0 ? (annualCashFlow / down) * 100 : 0;

  // Simple state tax on taxable real-estate income
  const buildingValue = price * (buildingPct / 100);
  const depreciationAnnual = buildingValue / 27.5;
  const taxableIncome = Math.max(0, noi - firstMonthInterest * 12 - depreciationAnnual);
  const estStateTax = incomeTaxLiability(stateCode, taxableIncome);
  const afterTaxCashFlow = annualCashFlow - estStateTax;

  // Chart
  const chartData = [
    { name: "EGI", value: Math.max(0, egi) },
    { name: "Operating Exp", value: Math.max(0, operatingExpenses) },
    { name: "NOI", value: Math.max(0, noi) },
    { name: "Debt Service", value: Math.max(0, annualDebtService) },
    { name: "Cash Flow", value: annualCashFlow },
    { name: "After-Tax CF", value: afterTaxCashFlow }
  ];

  return (
    <div className="max-w-6xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-800">🏠 Landlord Profitability</h1>
        <p className="text-sm text-gray-600">
          Uses your state’s property-tax average. Computes NOI, cap rate, cash flow, and a simple state after-tax view.
          Federal taxes, NIIT, passive limits, and AMT are not modeled.
        </p>
      </header>

      <div className="grid xl:grid-cols-4 gap-6">
        {/* Location + Financing */}
        <section className="rounded-xl border p-4 space-y-4 xl:col-span-1">
          <div>
            <label className="block text-sm font-medium text-gray-700">State</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 p-2 bg-white"
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Property tax auto-applied.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={price} min={0} onChange={(e) => setPrice(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Down (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={downPct} min={0} max={100} step="0.1"
                onChange={(e) => setDownPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate (% APR)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={ratePct} min={0} step="0.01"
                onChange={(e) => setRatePct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Term (yrs)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={termYrs} min={5} max={40}
                onChange={(e) => setTermYrs(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Building Portion (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={buildingPct} min={0} max={100} step="1"
                onChange={(e) => setBuildingPct(Number(e.target.value))}
              />
              <p className="mt-1 text-xs text-gray-500">For depreciation. Land not depreciable.</p>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-600">Down Payment</span><span className="font-semibold">${down.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Loan Amount</span><span className="font-semibold">${loan.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">P&I</span><span className="font-semibold">${piMonthly.toFixed(0)}/mo</span></div>
          </div>
        </section>

        {/* Income */}
        <section className="rounded-xl border p-4 space-y-4 xl:col-span-1">
          <h2 className="font-semibold text-gray-800">Income</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rent ($/mo)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={rentMonthly} min={0}
                onChange={(e) => setRentMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vacancy (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={vacancyPct} min={0} max={50} step="0.1"
                onChange={(e) => setVacancyPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Other Income ($/mo)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={otherIncomeMonthly} min={0}
              onChange={(e) => setOtherIncomeMonthly(Number(e.target.value))}
            />
          </div>
        </section>

        {/* Expenses */}
        <section className="rounded-xl border p-4 space-y-4 xl:col-span-1">
          <h2 className="font-semibold text-gray-800">Operating Expenses</h2>

          <div className="rounded-lg bg-gray-50 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Property Tax (annual)</span>
              <span className="font-semibold">${annualPropTax.toLocaleString()}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">From state average.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance ($/mo)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={insuranceMonthly} min={0}
                onChange={(e) => setInsuranceMonthly(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Utilities ($/mo)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={utilitiesMonthly} min={0}
                onChange={(e) => setUtilitiesMonthly(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Repairs (% of rent)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={repairsPct} min={0} max={30} step="0.1"
                onChange={(e) => setRepairsPct(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Management (% of rent)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
                value={managementPct} min={0} max={30} step="0.1"
                onChange={(e) => setManagementPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">HOA ($/mo)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border border-gray-300 p-2"
              value={hoaMonthly} min={0}
              onChange={(e) => setHoaMonthly(Number(e.target.value))}
            />
          </div>
        </section>

        {/* Results */}
        <section className="rounded-xl border p-4 space-y-4 xl:col-span-1">
          <h2 className="font-semibold text-gray-800">Results</h2>

          <div className="rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-gray-600">EGI</span><span className="font-semibold">${egi.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Operating Exp</span><span className="font-semibold">${operatingExpenses.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">NOI</span><span className="font-semibold">${noi.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Debt Service</span><span className="font-semibold">${annualDebtService.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Cash Flow</span><span className={`font-semibold ${annualCashFlow < 0 ? "text-rose-600" : "text-green-700"}`}>${annualCashFlow.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Cap Rate</span><span className="font-semibold">{capRate.toFixed(2)}%</span></div>
            <div className="flex justify-between"><span className="text-gray-600">Cash-on-Cash</span><span className="font-semibold">{coc.toFixed(2)}%</span></div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm space-y-1">
            <div className="flex justify-between"><span className="text-blue-900">Depreciation (annual)</span><span className="font-semibold text-blue-900">${depreciationAnnual.toFixed(0)}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">Taxable Income</span><span className="font-semibold text-blue-900">${taxableIncome.toFixed(0)}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">State Tax (est.)</span><span className="font-semibold text-blue-900">${estStateTax.toFixed(0)}</span></div>
            <div className="flex justify-between"><span className="text-blue-900">After-Tax Cash Flow</span><span className="font-semibold text-blue-900">${afterTaxCashFlow.toFixed(0)}</span></div>
          </div>
        </section>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="value" name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <footer className="mt-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
        <ul className="list-disc pl-5 space-y-1">
          <li>State property-tax rate from dataset; county/city may vary.</li>
          <li>Tax section is simplified. Consult a CPA for full federal and state treatment.</li>
          <li>Adjust vacancy, repairs, and management to your market’s reality.</li>
        </ul>
      </footer>
    </div>
  );
}
