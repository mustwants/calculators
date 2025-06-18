import React, { useState } from 'react';

function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState('');
  const [downPayment, setDownPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [loanTermYears, setLoanTermYears] = useState('30');
  const [annualTaxes, setAnnualTaxes] = useState('');
  const [annualInsurance, setAnnualInsurance] = useState('');

  const loanAmount = Math.max(
    (parseFloat(homePrice) || 0) - (parseFloat(downPayment) || 0),
    0
  );

  const monthlyPayment = (() => {
    const rate = (parseFloat(interestRate) || 0) / 100 / 12;
    const termMonths = (parseInt(loanTermYears) || 30) * 12;
    const taxes = (parseFloat(annualTaxes) || 0) / 12;
    const insurance = (parseFloat(annualInsurance) || 0) / 12;

    if (rate === 0) {
      return loanAmount / termMonths + taxes + insurance;
    }

    const basePayment =
      loanAmount * rate / (1 - Math.pow(1 + rate, -termMonths));

    return basePayment + taxes + insurance;
  })();

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1>📊 Mortgage Calculator</h1>

      <label>Home Price:</label>
      <input type="number" value={homePrice} onChange={(e) => setHomePrice(e.target.value)} />

      <label>Down Payment:</label>
      <input type="number" value={downPayment} onChange={(e) => setDownPayment(e.target.value)} />

      <label>Interest Rate (%):</label>
      <input type="number" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} step="0.01" />

      <label>Loan Term (Years):</label>
      <input type="number" value={loanTermYears} onChange={(e) => setLoanTermYears(e.target.value)} />

      <label>Annual Property Tax:</label>
      <input type="number" value={annualTaxes} onChange={(e) => setAnnualTaxes(e.target.value)} />

      <label>Annual Insurance:</label>
      <input type="number" value={annualInsurance} onChange={(e) => setAnnualInsurance(e.target.value)} />

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Results</h2>
        <p>🏠 Loan Amount: <strong>${loanAmount.toFixed(2)}</strong></p>
        <p>💵 Estimated Monthly Payment: <strong>${monthlyPayment.toFixed(2)}</strong></p>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <a href="https://www.mustwants.com" target="_blank" rel="noopener noreferrer">
          🔗 Visit MustWants.com
        </a><br />
        <a href="https://www.militarygrad.com" target="_blank" rel="noopener noreferrer">
          🎓 Visit MilitaryGrad.com
        </a>
      </div>
    </div>
  );
}

export default MortgageCalculator;

