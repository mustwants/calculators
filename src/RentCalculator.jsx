import React, { useState } from 'react';

function RentCalculator() {
  const [monthlyRent, setMonthlyRent] = useState('');
  const [annualIncrease, setAnnualIncrease] = useState('');
  const [years, setYears] = useState('1');

  const totalRent = (() => {
    let total = 0;
    let rent = parseFloat(monthlyRent) || 0;
    let increase = (parseFloat(annualIncrease) || 0) / 100;
    for (let i = 0; i < (parseInt(years) || 1); i++) {
      total += rent * 12;
      rent += rent * increase;
    }
    return total;
  })();

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">🏠 Rent Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
          <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Increase (%)</label>
          <input type="number" value={annualIncrease} onChange={e => setAnnualIncrease(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Years</label>
          <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <span>Total Rent Paid: <strong>${totalRent.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}

export default RentCalculator;
