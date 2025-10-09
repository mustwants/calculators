// PATH: src/SBPDecisionCalculator.jsx
import React, { useEffect, useMemo, useState } from "react";
import { loadMasterData } from "./utils/loadMasterData";

export default function SBPDecisionCalculator() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  // Inputs
  const [memberRank, setMemberRank] = useState("O-5");
  const [yos, setYos] = useState(24);
  const [memberAge, setMemberAge] = useState(47);
  const [spouseAge, setSpouseAge] = useState(40);
  const [coveredPct, setCoveredPct] = useState(100); // SBP base coverage percent
  const [insPremMonthly, setInsPremMonthly] = useState(250); // commercial life premium
  const [lifeExpectancy, setLifeExpectancy] = useState(85);

  useEffect(() => {
    loadMasterData().then(setData).catch(setErr);
  }, []);

  const monthlyBasePay = useMemo(() => {
    if (!data?.basePay?.[memberRank]) return 0;
    // choose nearest YOS bucket available in base table
    const table = data.basePay[memberRank];
    const keys = Object.keys(table);
    if (!keys.length) return 0;
    // pick max key <= yos, else smallest
    const numericKeys = keys
      .map((k) => (k === "<2" ? 1 : Number(k)))
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b);
    let sel = numericKeys[0];
    for (const k of numericKeys) if (k <= yos) sel = k;
    const keyStr = sel === 1 ? "<2" : String(sel);
    return Number(table[keyStr] || 0);
  }, [data, memberRank, yos]);

  if (err) return <div className="p-4 text-rose-700">Failed to load data.</div>;
  if (!data) return <div className="p-4">Loading…</div>;

  const sbpBase = monthlyBasePay; // simplification for demo; you can allow custom base amount
  const sbpCovered = sbpBase * (coveredPct / 100);
  const sbpPremium = sbpCovered * 0.065; // 6.5% monthly
  const survivorBenefit = sbpCovered * 0.55; // 55% monthly to survivor

  return (
    <div className="max-w-5xl mx-auto my-8 p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold text-blue-800 mb-4">🛡️ SBP vs Insurance</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="rounded-xl border p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Rank</label>
            <select
              className="mt-1 w-full rounded-md border p-2 bg-white"
              value={memberRank}
              onChange={(e) => setMemberRank(e.target.value)}
            >
              {Object.keys(data.basePay).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Service</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={yos} min={2} max={40}
                onChange={(e) => setYos(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Coverage (%)</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={coveredPct} min={6.5} max={100} step="0.5"
                onChange={(e) => setCoveredPct(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Member Age</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={memberAge} min={18} max={85}
                onChange={(e) => setMemberAge(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spouse Age</label>
              <input
                type="number" className="mt-1 w-full rounded-md border p-2"
                value={spouseAge} min={18} max={85}
                onChange={(e) => setSpouseAge(Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Life Insurance Premium ($/mo)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={insPremMonthly} min={0}
              onChange={(e) => setInsPremMonthly(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Life Expectancy (years)</label>
            <input
              type="number" className="mt-1 w-full rounded-md border p-2"
              value={lifeExpectancy} min={50} max={100}
              onChange={(e) => setLifeExpectancy(Number(e.target.value))}
            />
          </div>
        </section>

        <section className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-gray-600">Estimated Monthly Base Pay</div>
          <div className="text-xl font-semibold">${monthlyBasePay.toLocaleString()}</div>

          <div className="mt-3 text-sm text-gray-600">SBP Covered Base</div>
          <div className="text-xl font-semibold">${sbpCovered.toLocaleString()}</div>

          <div className="mt-3 text-sm text-gray-600">SBP Premium (6.5%)</div>
          <div className="text-xl font-semibold">${sbpPremium.toFixed(2)}</div>

          <div className="mt-3 text-sm text-gray-600">Survivor Benefit (55%)</div>
          <div className="text-xl font-semibold">${survivorBenefit.toFixed(2)}</div>
        </section>

        <section className="rounded-xl border p-4 space-y-2">
          <div className="text-sm text-gray-600">Commercial Life Premium</div>
          <div className="text-xl font-semibold">${insPremMonthly.toFixed(2)}/mo</div>

          <div className="mt-4 text-sm text-blue-900 bg-blue-50 p-3 rounded-lg">
            <div className="font-semibold mb-1">SBP Rules Snapshot</div>
            <ul className="list-disc pl-5 space-y-1">
              <li>Premium ~6.5% of covered base amount.</li>
              <li>Benefit = 55% of covered base to eligible survivor.</li>
              <li>Paid-up after **30 years of premiums AND age 70**.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
