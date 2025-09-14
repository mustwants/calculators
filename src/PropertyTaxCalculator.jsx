import React, { useState } from 'react';

function PropertyTaxCalculator() {
  const [homePrice, setHomePrice] = useState('');
  const [taxRate, setTaxRate] = useState('');

  const annualTax = (parseFloat(homePrice) || 0) * ((parseFloat(taxRate) || 0) / 100);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">🏡 Property Tax Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Home Price</label>
          <input type="number" value={homePrice} onChange={e => setHomePrice(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
          <input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <span>Annual Property Tax: <strong>${annualTax.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}

export default PropertyTaxCalculator;
