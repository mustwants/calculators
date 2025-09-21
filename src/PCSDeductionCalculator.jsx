import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import nationalAverages from './data/nationalAverages.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PCSDeductionCalculator = () => {
  const defaults = nationalAverages.calculatorDefaults.pcsDeduction;
  
  const [inputs, setInputs] = useState({
    grossIncome: defaults.grossIncome,
    bah: defaults.bah,
    pcsTimeframe: defaults.pcsTimeframe,
    filingStatus: defaults.filingStatus,
    homePrice: defaults.homePrice,
    downPayment: defaults.downPayment,
    mortgageRate: nationalAverages.mortgageRates.vaLoan30Year,
    propertyTax: nationalAverages.housing.nationalAverages.propertyTaxRate,
    maintenance: nationalAverages.housing.nationalAverages.homeMaintenancePercent,
    hasChildren: defaults.hasChildren
  });

  const [calculations, setCalculations] = useState({
    homeowner: {},
    renter: {},
    comparison: {}
  });

  const calculateTaxes = (income, deductions, filingStatus) => {
    const taxableIncome = Math.max(0, income - deductions);
    const brackets = nationalAverages.taxData.federalTaxBrackets;
    let tax = 0;
    
    for (const bracket of brackets) {
      const taxableInBracket = Math.min(
        Math.max(0, taxableIncome - bracket.min),
        bracket.max - bracket.min
      );
      tax += taxableInBracket * (bracket.rate / 100);
      if (taxableIncome <= bracket.max) break;
    }
    
    return tax;
  };

  const calculateHomeownerScenario = () => {
    const loanAmount = inputs.homePrice * (1 - inputs.downPayment / 100);
    const monthlyRate = (inputs.mortgageRate / 100) / 12;
    const numPayments = inputs.pcsTimeframe;
    
    // Monthly mortgage payment (P&I)
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                     (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Other monthly costs
    const monthlyPropertyTax = (inputs.homePrice * inputs.propertyTax / 100) / 12;
    const monthlyInsurance = (inputs.homePrice * nationalAverages.housing.nationalAverages.homeInsuranceRate / 100) / 12;
    const monthlyMaintenance = (inputs.homePrice * inputs.maintenance / 100) / 12;
    const monthlyUtilities = nationalAverages.housing.utilityAverages.total;
    
    const totalHousingCost = monthlyPI + monthlyPropertyTax + monthlyInsurance + 
                           monthlyMaintenance + monthlyUtilities;
    
    // Tax deductions
    const standardDeduction = nationalAverages.taxData.standardDeduction[inputs.filingStatus];
    const annualInterest = loanAmount * (inputs.mortgageRate / 100); // Simplified for first year
    const annualPropertyTax = inputs.homePrice * (inputs.propertyTax / 100);
    const totalDeductions = standardDeduction + annualInterest + annualPropertyTax;
    
    // Tax calculations
    const taxesWithDeductions = calculateTaxes(inputs.grossIncome, totalDeductions, inputs.filingStatus);
    const taxesStandard = calculateTaxes(inputs.grossIncome, standardDeduction, inputs.filingStatus);
    const taxSavings = taxesStandard - taxesWithDeductions;
    
    // Net cost analysis
    const totalPaidOverPCS = totalHousingCost * inputs.pcsTimeframe;
    const principalPaydown = loanAmount - (loanAmount * Math.pow(1 + monthlyRate, numPayments) - 
                           monthlyPI * ((Math.pow(1 + monthlyRate, numPayments) - 1) / monthlyRate));
    const estimatedAppreciation = inputs.homePrice * 
                                (nationalAverages.housing.nationalAverages.appreciationRate / 100) * 
                                (inputs.pcsTimeframe / 12);
    
    // Selling costs when PCS
    const sellingCosts = inputs.homePrice * 
                        (nationalAverages.pcsSpecific.sellingCosts.realtorCommission + 
                         nationalAverages.pcsSpecific.sellingCosts.closingCosts + 
                         nationalAverages.pcsSpecific.sellingCosts.repairs) / 100;
    
    const netEquityGain = principalPaydown + estimatedAppreciation - sellingCosts;
    const netCostAfterPCS = totalPaidOverPCS - netEquityGain - (taxSavings * (inputs.pcsTimeframe / 12));

    return {
      monthlyHousingCost: totalHousingCost,
      monthlyPI,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyMaintenance,
      monthlyUtilities,
      annualTaxSavings: taxSavings,
      totalPaidOverPCS,
      netEquityGain,
      netCostAfterPCS,
      principalPaydown,
      estimatedAppreciation,
      sellingCosts
    };
  };

  const calculateRenterScenario = () => {
    const monthlyRent = nationalAverages.housing.rentByBedrooms.threeBedroom; // Default 3BR
    const monthlyUtilities = nationalAverages.housing.utilityAverages.total * 0.7; // Renter pays less utilities
    const monthlyRentersInsurance = 25; // Average renters insurance
    
    const totalHousingCost = monthlyRent + monthlyUtilities + monthlyRentersInsurance;
    
    // No tax deductions for renters
    const standardDeduction = nationalAverages.taxData.standardDeduction[inputs.filingStatus];
    const taxes = calculateTaxes(inputs.grossIncome, standardDeduction, inputs.filingStatus);
    
    // Opportunity cost of down payment invested
    const downPaymentAmount = inputs.homePrice * (inputs.downPayment / 100);
    const investmentReturn = 0.07; // 7% average market return
    const opportunityGain = downPaymentAmount * Math.pow(1 + investmentReturn, inputs.pcsTimeframe / 12) - downPaymentAmount;
    
    const totalPaidOverPCS = totalHousingCost * inputs.pcsTimeframe;
    const netCostAfterPCS = totalPaidOverPCS - opportunityGain;

    return {
      monthlyHousingCost: totalHousingCost,
      monthlyRent,
      monthlyUtilities,
      monthlyRentersInsurance,
      annualTaxes: taxes,
      totalPaidOverPCS,
      opportunityGain,
      netCostAfterPCS,
      downPaymentInvested: downPaymentAmount
    };
  };

  useEffect(() => {
    const homeowner = calculateHomeownerScenario();
    const renter = calculateRenterScenario();
    
    const comparison = {
      monthlySavings: renter.monthlyHousingCost - homeowner.monthlyHousingCost,
      totalSavings: renter.netCostAfterPCS - homeowner.netCostAfterPCS,
      breakEvenMonth: Math.abs((renter.netCostAfterPCS - homeowner.netCostAfterPCS) / 
                              (renter.monthlyHousingCost - homeowner.monthlyHousingCost)),
      recommendation: renter.netCostAfterPCS < homeowner.netCostAfterPCS ? 'rent' : 'buy'
    };
    
    setCalculations({ homeowner, renter, comparison });
  }, [inputs]);

  const pieChartDataBuy = {
    labels: ['Principal & Interest', 'Property Tax', 'Insurance', 'Maintenance', 'Utilities'],
    datasets: [{
      data: [
        calculations.homeowner.monthlyPI || 0,
        calculations.homeowner.monthlyPropertyTax || 0,
        calculations.homeowner.monthlyInsurance || 0,
        calculations.homeowner.monthlyMaintenance || 0,
        calculations.homeowner.monthlyUtilities || 0
      ],
      backgroundColor: [
        '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const pieChartDataRent = {
    labels: ['Rent', 'Utilities', 'Renters Insurance'],
    datasets: [{
      data: [
        calculations.renter.monthlyRent || 0,
        calculations.renter.monthlyUtilities || 0,
        calculations.renter.monthlyRentersInsurance || 0
      ],
      backgroundColor: [
        '#3b82f6', '#8b5cf6', '#f59e0b'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const barChartData = {
    labels: ['Monthly Cost', 'Total Over PCS', 'Net Cost After PCS'],
    datasets: [
      {
        label: 'Buying',
        data: [
          calculations.homeowner.monthlyHousingCost || 0,
          calculations.homeowner.totalPaidOverPCS || 0,
          calculations.homeowner.netCostAfterPCS || 0
        ],
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        borderWidth: 1
      },
      {
        label: 'Renting',
        data: [
          calculations.renter.monthlyHousingCost || 0,
          calculations.renter.totalPaidOverPCS || 0,
          calculations.renter.netCostAfterPCS || 0
        ],
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Housing Costs Comparison'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': $' + context.parsed.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          🎖️ PCS Deduction Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Compare the financial impact of buying vs renting during your PCS cycle, 
          including tax deductions and equity considerations.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gross Annual Income
          </label>
          <input
            type="range"
            min="30000"
            max="200000"
            step="5000"
            value={inputs.grossIncome}
            onChange={(e) => setInputs({...inputs, grossIncome: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$30K</span>
            <span className="font-medium">${inputs.grossIncome.toLocaleString()}</span>
            <span>$200K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly BAH
          </label>
          <input
            type="range"
            min="800"
            max="4000"
            step="50"
            value={inputs.bah}
            onChange={(e) => setInputs({...inputs, bah: parseInt(e.target.value)})}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$800</span>
            <span className="font-medium">${inputs.bah.toLocaleString()}</span>
            <span>$4K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Home Price
          </label>
          <input
            type="range"
            min="150000"
            max="800000"
            step="10000"
            value={inputs.homePrice}
            onChange={(e) => setInputs({...inputs, homePrice: parseInt(e.target.value)})}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$150K</span>
            <span className="font-medium">${inputs.homePrice.toLocaleString()}</span>
            <span>$800K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PCS Timeframe (months)
          </label>
          <input
            type="range"
            min="12"
            max="72"
            step="6"
            value={inputs.pcsTimeframe}
            onChange={(e) => setInputs({...inputs, pcsTimeframe: parseInt(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1 yr</span>
            <span className="font-medium">{inputs.pcsTimeframe} months</span>
            <span>6 yrs</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filing Status
          </label>
          <select
            value={inputs.filingStatus}
            onChange={(e) => setInputs({...inputs, filingStatus: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="single">Single</option>
            <option value="marriedJoint">Married Filing Jointly</option>
            <option value="marriedSeparate">Married Filing Separately</option>
            <option value="headOfHousehold">Head of Household</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Down Payment %
          </label>
          <input
            type="range"
            min="0"
            max="25"
            step="5"
            value={inputs.downPayment}
            onChange={(e) => setInputs({...inputs, downPayment: parseInt(e.target.value)})}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-medium">{inputs.downPayment}%</span>
            <span>25%</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Results Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* If You Buy Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-green-800">🏠 If You Buy</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ${(calculations.homeowner.monthlyHousingCost || 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Monthly Total</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Principal & Interest</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.homeowner.monthlyPI || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Property Tax</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.homeowner.monthlyPropertyTax || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Insurance</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.homeowner.monthlyInsurance || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Maintenance</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.homeowner.monthlyMaintenance || 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Monthly Budget Breakdown</div>
            <div className="h-64">
              <Pie data={pieChartDataBuy} options={pieOptions} />
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Annual Tax Savings:</span>
              <span className="font-semibold text-green-800">
                ${(calculations.homeowner.annualTaxSavings || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Equity Gain at PCS:</span>
              <span className="font-semibold text-green-800">
                ${(calculations.homeowner.netEquityGain || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span className="text-green-700">Net Cost After PCS:</span>
              <span className="text-green-800">
                ${(calculations.homeowner.netCostAfterPCS || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* If You Rent Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-800">🏠 If You Rent</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                ${(calculations.renter.monthlyHousingCost || 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Monthly Total</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Monthly Rent</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.renter.monthlyRent || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Utilities</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.renter.monthlyUtilities || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 col-span-2">
              <div className="text-sm text-gray-600">Renters Insurance</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.renter.monthlyRentersInsurance || 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Monthly Budget Breakdown</div>
            <div className="h-64">
              <Pie data={pieChartDataRent} options={pieOptions} />
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Down Payment Invested:</span>
              <span className="font-semibold text-blue-800">
                ${(calculations.renter.downPaymentInvested || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Investment Gain at PCS:</span>
              <span className="font-semibold text-blue-800">
                ${(calculations.renter.opportunityGain || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span className="text-blue-700">Net Cost After PCS:</span>
              <span className="text-blue-800">
                ${(calculations.renter.netCostAfterPCS || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Buy vs Rent Cost Comparison Over PCS Timeframe
        </h3>
        <div className="h-96">
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      {/* Recommendation */}
      <div className={`rounded-xl p-6 text-center ${
        calculations.comparison.recommendation === 'buy' 
          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
          : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
      }`}>
        <h3 className="text-2xl font-bold mb-2">
          💡 Recommendation for Your PCS
        </h3>
        <p className="text-xl mb-4">
          Based on your {inputs.pcsTimeframe}-month timeline, 
          <span className="font-bold">
            {calculations.comparison.recommendation === 'buy' ? ' BUYING' : ' RENTING'}
          </span> is financially better.
        </p>
        <p className="text-lg">
          {calculations.comparison.recommendation === 'buy' 
            ? `You'll save approximately $${Math.abs(calculations.comparison.totalSavings || 0).toLocaleString()} by buying.`
            : `You'll save approximately $${Math.abs(calculations.comparison.totalSavings || 0).toLocaleString()} by renting.`
          }
        </p>
        <p className="text-sm mt-2 opacity-90">
          This includes tax benefits, equity gains, and opportunity costs over your PCS cycle.
        </p>
      </div>

      {/* Export Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <button 
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          onClick={() => window.print()}
        >
          📄 Download PDF Report
        </button>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          onClick={() => {
            const scenario = {
              inputs,
              calculations,
              timestamp: new Date().toISOString()
            };
            localStorage.setItem('pcsDeductionScenario', JSON.stringify(scenario));
            alert('Scenario saved to browser storage!');
          }}
        >
          💾 Save Scenario
        </button>
      </div>
    </div>
  );
};

export default PCSDeductionCalculator;