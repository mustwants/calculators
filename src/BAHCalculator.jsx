// Simple BAH Calculator
import React, { useState } from 'react';

function BAHCalculator() {
  const [bah, setBah] = useState('2100');
  const [monthlyRent, setMonthlyRent] = useState('1850');

  const offset = (parseFloat(bah) || 0) - (parseFloat(monthlyRent) || 0);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">🎖️ BAH Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly BAH</label>
          <input type="number" value={bah} onChange={e => setBah(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="2,100" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
          <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="1,850" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <span>BAH Savings: <strong>$</strong>{offset.toFixed(2)}</span>
      </div>
      
      {/* Footer Links */}
      <div className="mt-6 text-center">
        <div className="space-y-2">
          <div>
            <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              🔗 Visit MustWants.com
            </a>
            <span className="mx-2">|</span>
            <a href="https://www.militarygrad.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              🎓 Visit MilitaryGrad.com
            </a>
          </div>
          <p className="text-xs text-gray-500">
            VetMover™ is sponsored by <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">MustWants.com</a> and is a trademark of MustWants.
          </p>
        </div>
      </div>
    </div>
  );
}

export default BAHCalculator;
