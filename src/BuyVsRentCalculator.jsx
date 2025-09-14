import React, { useState } from 'react';

function BuyVsRentCalculator() {
  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [years, setYears] = useState('1');

  const totalBuyCost = (parseFloat(homePrice) || 0) - (parseFloat(downPayment) || 0);
  const totalRentCost = (parseFloat(monthlyRent) || 0) * 12 * (parseInt(years) || 1);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">🔄 Buy vs Rent Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Home Price</label>
          <input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Down Payment</label>
          <input type="number" value={downPayment} onChange={e => setDownPayment(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
          <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Years</label>
          <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <span>Total Buy Cost: <strong>${totalBuyCost.toFixed(2)}</strong></span><br />
        <span>Total Rent Cost: <strong>${totalRentCost.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}

export default BuyVsRentCalculator;
