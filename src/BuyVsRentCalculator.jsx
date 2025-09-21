import React, { useState } from 'react';

function BuyVsRentCalculator() {
  const [homePrice, setHomePrice] = useState('420000'); // National median
  const [downPayment, setDownPayment] = useState('84000'); // 20% of 420k
  const [interestRate, setInterestRate] = useState('6.75'); // Current average
  const [monthlyRent, setMonthlyRent] = useState('1650'); // National average
  const [years, setYears] = useState('5');
  const [annualTaxes, setAnnualTaxes] = useState('6300'); // 1.5% of 420k
  const [annualInsurance, setAnnualInsurance] = useState('1800'); // Average homeowner's insurance
  const [rentIncrease, setRentIncrease] = useState('3');
  const [homeAppreciation, setHomeAppreciation] = useState('3');

  const homeValue = parseFloat(homePrice) || 0;
  const downPaymentAmount = parseFloat(downPayment) || 0;
  const loanAmount = homeValue - downPaymentAmount;
  const rate = (parseFloat(interestRate) || 0) / 100 / 12;
  const termMonths = 30 * 12; // 30 year mortgage
  const yearsNum = parseInt(years) || 5;

  // Calculate monthly mortgage payment
  const monthlyMortgage = rate > 0 && loanAmount > 0
    ? loanAmount * rate / (1 - Math.pow(1 + rate, -termMonths))
    : loanAmount / termMonths;

  const monthlyTaxes = (parseFloat(annualTaxes) || 0) / 12;
  const monthlyInsurance = (parseFloat(annualInsurance) || 0) / 12;
  const totalMonthlyBuy = monthlyMortgage + monthlyTaxes + monthlyInsurance;

  // Calculate total costs over the specified years
  const totalBuyCost = (() => {
    const totalPayments = totalMonthlyBuy * yearsNum * 12;
    const downPaymentCost = downPaymentAmount;
    const closingCosts = homeValue * 0.03; // Estimate 3% closing costs
    return totalPayments + downPaymentCost + closingCosts;
  })();

  const totalRentCost = (() => {
    let total = 0;
    let currentRent = parseFloat(monthlyRent) || 0;
    const increase = (parseFloat(rentIncrease) || 0) / 100;
    
    for (let year = 0; year < yearsNum; year++) {
      total += currentRent * 12;
      currentRent += currentRent * increase;
    }
    return total;
  })();

  // Calculate home equity gained
  const homeEquity = (() => {
    const appreciation = (parseFloat(homeAppreciation) || 0) / 100;
    const futureValue = homeValue * Math.pow(1 + appreciation, yearsNum);
    
    // Calculate principal paid down (simplified)
    const principalPaid = monthlyMortgage * yearsNum * 12 * 0.3; // Rough estimate
    
    return (futureValue - loanAmount) + principalPaid;
  })();

  const netBuyCost = totalBuyCost - homeEquity;

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
          <label className="block text-sm font-medium text-gray-700">Interest Rate (%)</label>
          <input type="number" value={interestRate} onChange={e => setInterestRate(e.target.value)} step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Monthly Rent</label>
          <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Property Tax</label>
          <input type="number" value={annualTaxes} onChange={e => setAnnualTaxes(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Insurance</label>
          <input type="number" value={annualInsurance} onChange={e => setAnnualInsurance(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Years to Compare</label>
          <input type="number" value={years} onChange={e => setYears(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Annual Rent Increase (%)</label>
          <input type="number" value={rentIncrease} onChange={e => setRentIncrease(e.target.value)} step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Home Appreciation (%)</label>
          <input type="number" value={homeAppreciation} onChange={e => setHomeAppreciation(e.target.value)} step="0.1" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results ({years} years)</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>💵 Monthly Mortgage + Taxes + Insurance:</span>
            <strong>${totalMonthlyBuy.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between">
            <span>🏠 Total Buy Cost:</span>
            <strong>${totalBuyCost.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>🏢 Total Rent Cost:</span>
            <strong>${totalRentCost.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>📈 Home Equity Gained:</span>
            <strong className="text-green-600">+${homeEquity.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span>💰 Net Buy Cost (after equity):</span>
            <strong>${netBuyCost.toLocaleString()}</strong>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-gray-50">
            <div className={`text-lg font-semibold ${netBuyCost < totalRentCost ? 'text-green-600' : 'text-blue-600'}`}>
              {netBuyCost < totalRentCost 
                ? `🏠 Buying saves $${(totalRentCost - netBuyCost).toLocaleString()} over ${years} years`
                : `🏢 Renting saves $${(netBuyCost - totalRentCost).toLocaleString()} over ${years} years`
              }
            </div>
          </div>
        </div>
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

export default BuyVsRentCalculator;
