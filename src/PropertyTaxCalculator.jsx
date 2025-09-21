import React, { useState } from 'react';

function PropertyTaxCalculator() {
  const [homePrice, setHomePrice] = useState('420000'); // National median home price
  const [taxRate, setTaxRate] = useState('1.1'); // National average property tax rate

  const annualTax = (parseFloat(homePrice) || 0) * ((parseFloat(taxRate) || 0) / 100);
  const monthlyTax = annualTax / 12;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-purple-800 flex items-center justify-center gap-3">
          🏡 Property Tax Calculator
        </h1>
        <p className="text-gray-600">Calculate annual and monthly property taxes for homeownership planning</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="homePrice" className="block text-sm font-medium text-gray-700 mb-2">Home Price</label>
          <input 
            id="homePrice"
            type="number" 
            value={homePrice} 
            onChange={(e) => setHomePrice(e.target.value)} 
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
            placeholder="e.g., 420,000"
          />
          <p className="mt-1 text-xs text-gray-500">National median: $420,000</p>
        </div>
        <div>
          <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
          <input 
            id="taxRate"
            type="number" 
            value={taxRate} 
            onChange={(e) => setTaxRate(e.target.value)} 
            step="0.01"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-colors" 
            placeholder="e.g., 1.1"
          />
          <p className="mt-1 text-xs text-gray-500">National average: 1.1%</p>
        </div>
      </div>
      
      <div className="mb-6 p-6 bg-purple-50 rounded-lg border border-purple-200">
        <h2 className="text-lg font-semibold mb-4 text-purple-800">💰 Property Tax Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-purple-700">🏠 Home Value: <strong>${parseFloat(homePrice || 0).toLocaleString()}</strong></span>
            <span className="text-purple-700">📊 Tax Rate: <strong>{parseFloat(taxRate || 0).toFixed(2)}%</strong></span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-purple-700">📅 Annual Tax: <strong>${annualTax.toLocaleString()}</strong></span>
            <span className="text-purple-700">📆 Monthly Tax: <strong>${monthlyTax.toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <div className="space-y-2">
          <div>
            <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
              🔗 Visit MustWants.com
            </a>
            <span className="mx-2">|</span>
            <a href="https://www.militarygrad.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
              🎓 Visit MilitaryGrad.com
            </a>
          </div>
          <p className="text-xs text-gray-500">
            VetMover™ is sponsored by <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">MustWants.com</a> and is a trademark of MustWants.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PropertyTaxCalculator;
