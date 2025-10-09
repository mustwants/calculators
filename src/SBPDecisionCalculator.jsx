//PATH calculators/src/SBPDecisionCalculator.jsx

import React, { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import masterData from "./data/masterData.json";

// Insurance rates last verified: Jan 2025 (NerdWallet composite averages, 20-year term, non-smoker)
const lifeInsuranceRates = {
  male: [
    { min: 30, max: 39, monthly: 23 },
    { min: 40, max: 49, monthly: 33 },
    { min: 50, max: 59, monthly: 73 },
    { min: 60, max: 69, monthly: 183 },
    { min: 70, max: 120, monthly: 395 },
  ],
  female: [
    { min: 30, max: 39, monthly: 19 },
    { min: 40, max: 49, monthly: 28 },
    { min: 50, max: 59, monthly: 56 },
    { min: 60, max: 69, monthly: 132 },
    { min: 70, max: 120, monthly: 285 },
  ],
};

function getLifeInsuranceRate(age, gender) {
  const group = lifeInsuranceRates[gender.toLowerCase()] || [];
  const match = group.find((g) => age >= g.min && age <= g.max);
  return match ? match.monthly * 12 : 0; // annual cost
}

export default function SBPDecisionCalculator() {
  const [rank, setRank] = useState("E-5");
  const [years, setYears] = useState(20);
  const [age, setAge] = useState(45);
  const [gender, setGender] = useState("male");
  const [spouseAge, setSpouseAge] = useState(43);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [insuranceAmount, setInsuranceAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(3.5);

  const sbpRate = 0.065;
  const survivorPct = 0.55;

  const basePay = masterData.basePay[rank]?.[years] || 0;
  const sbpMonthly = basePay * sbpRate;
  const sbpAnnual = sbpMonthly * 12;
  const sbpBenefit = basePay * survivorPct;
  const lifeAnnualCost = getLifeInsuranceRate(age, gender);

  // Build cumulative data
  const chartData = useMemo(() => {
    const yearsArr = [];
    let sbpCost = 0;
    let lifeCost = 0;
    let sbpBenefitCum = 0;
    let lifeBenefitCum = 0;
    const interest = interestRate / 100;

    for (let i = 1; i <= lifeExpectancy - age; i++) {
      const currentAge = age + i;
      const stillPayingSBP = i <= 30 && currentAge < 70;
      const sbpThisYear = stillPayingSBP ? sbpAnnual : 0;
      const lifeThisYear = i <= 20 ? lifeAnnualCost : 0;

      sbpCost += sbpThisYear;
      lifeCost += lifeThisYear;

      // Benefits start after member's death — assume death at lifeExpectancy
      if (i >= lifeExpectancy - age) {
        sbpBenefitCum += sbpBenefit * (1 + interest) ** (lifeExpectancy - age - i);
        lifeBenefitCum += insuranceAmount;
      }

      yearsArr.push({
        year: i,
        SBP_Cost: sbpCost,
        Life_Cost: lifeCost,
        SBP_Benefit: sbpBenefitCum,
        Life_Benefit: lifeBenefitCum,
      });
    }
    return yearsArr;
  }, [age, gender, basePay, sbpAnnual, sbpBenefit, lifeAnnualCost, lifeExpectancy, interestRate, insuranceAmount]);

  const last = chartData[chartData.length - 1] || {};
  const recommendation =
    last.SBP_Benefit > last.Life_Benefit
      ? `SBP provides greater lifetime value beyond age ${lifeExpectancy}.`
      : `Life insurance provides greater payout or flexibility before age ${lifeExpectancy}.`;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">SBP vs Life Insurance Decision Calculator</h1>

      {/* Input Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-1">Rank</label>
          <select value={rank} onChange={(e) => setRank(e.target.value)} className="w-full border rounded p-2">
            {Object.keys(masterData.basePay).map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Years of Service</label>
          <input
            type="number"
            value={years}
            min="2"
            max="40"
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Your Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Spouse Age</label>
          <input
            type="number"
            value={spouseAge}
            onChange={(e) => setSpouseAge(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded p-2">
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expected Life Expectancy</label>
          <input
            type="number"
            value={lifeExpectancy}
            min={age + 1}
            max="100"
            onChange={(e) => setLifeExpectancy(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Life Insurance Coverage ($)</label>
          <input
            type="number"
            value={insuranceAmount}
            onChange={(e) => setInsuranceAmount(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Investment Interest Rate (%)</label>
          <input
            type="number"
            value={interestRate}
            step="0.1"
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p>Base Pay: <b>${basePay.toLocaleString()}</b>/mo</p>
        <p>SBP Premium: <b>${sbpMonthly.toFixed(2)}</b>/mo ({(sbpRate * 100).toFixed(1)}%)</p>
        <p>SBP Survivor Benefit: <b>${sbpBenefit.toFixed(2)}</b>/mo ({(survivorPct * 100).toFixed(0)}% of base pay)</p>
        <p>Life Insurance Cost: <b>${lifeAnnualCost.toFixed(2)}</b>/yr (average for {gender})</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData}>
          <XAxis dataKey="year" label={{ value: "Years from Now", position: "insideBottom", offset: -5 }} />
          <YAxis />
          <Tooltip formatter={(v) => `$${Math.round(v).toLocaleString()}`} />
          <Legend />
          <Line type="monotone" dataKey="SBP_Cost" stroke="#2563eb" name="SBP Cumulative Cost" />
          <Line type="monotone" dataKey="Life_Cost" stroke="#f97316" name="Life Cumulative Cost" />
          <Line type="monotone" dataKey="SBP_Benefit" stroke="#22c55e" name="SBP Benefit Value" strokeDasharray="5 5" />
          <Line type="monotone" dataKey="Life_Benefit" stroke="#e11d48" name="Life Benefit Value" strokeDasharray="5 5" />
        </LineChart>
      </ResponsiveContainer>

      {/* Recommendation */}
      <div className="mt-6 p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
        <h2 className="font-semibold text-lg mb-1">Recommendation</h2>
        <p>{recommendation}</p>
      </div>
    </div>
  );
}
