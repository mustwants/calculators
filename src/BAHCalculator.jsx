import React, { useState } from 'react';

function BAHCalculator() {
  const [bah, setBah] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');

  const offset = (parseFloat(bah) || 0) - (parseFloat(monthlyRent) || 0);

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-blue-700">🎖️ BAH Offset Calculator</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly BAH</label>
          <input type="number" value={bah} onChange={e => setBah(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
          <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <span>BAH Offset: <strong>${offset.toFixed(2)}</strong></span>
      </div>
    </div>
  );
}

export default BAHCalculator;
