
import React, { useState } from 'react';
import MortgageCalculator from './MortgageCalculator';
import RentCalculator from './RentCalculator';
import BuyVsRentCalculator from './BuyVsRentCalculator';
import BAHCalculator from './BAHCalculator';
import PropertyTaxCalculator from './PropertyTaxCalculator';

const calculators = [
  { name: 'Mortgage', component: <MortgageCalculator /> },
  { name: 'Rent', component: <RentCalculator /> },
  { name: 'Buy vs Rent', component: <BuyVsRentCalculator /> },
  { name: 'BAH Offset', component: <BAHCalculator /> },
  { name: 'Property Tax', component: <PropertyTaxCalculator /> },
];

function App() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="flex justify-center gap-4 py-6 bg-white shadow">
        {calculators.map((calc, idx) => (
          <button
            key={calc.name}
            className={`px-4 py-2 rounded font-semibold transition-colors ${selected === idx ? 'bg-blue-600 text-white' : 'bg-gray-200 text-blue-700 hover:bg-blue-100'}`}
            onClick={() => setSelected(idx)}
          >
            {calc.name}
          </button>
        ))}
      </nav>
      <main>
        {calculators[selected].component}
      </main>
    </div>
  );
}

export default App;

