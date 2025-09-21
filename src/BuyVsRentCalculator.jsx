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

function BuyVsRentCalculator() {
  const defaults = nationalAverages.calculatorDefaults.buyVsRent;
  
  const [inputs, setInputs] = useState({
    homePrice: defaults.homePrice,
    downPayment: defaults.downPayment,
    rentPrice: defaults.rentPrice,
    pcsTimeframe: defaults.pcsTimeframe,
    loanType: defaults.loanType,
    interestRate: nationalAverages.mortgageRates.vaLoan30Year,
    propertyTax: nationalAverages.housing.nationalAverages.propertyTaxRate,
    homeInsurance: nationalAverages.housing.nationalAverages.homeInsuranceRate,
    maintenance: nationalAverages.housing.nationalAverages.homeMaintenancePercent,
    rentIncrease: nationalAverages.housing.nationalAverages.inflationRate,
    homeAppreciation: nationalAverages.housing.nationalAverages.appreciationRate,
    includeMaintenance: defaults.includeMaintenance
  });

  const [calculations, setCalculations] = useState({
    buying: {},
    renting: {},
    comparison: {}
  });

  const calculateBuyingScenario = () => {
    const loanAmount = inputs.homePrice * (1 - inputs.downPayment / 100);
    const monthlyRate = (inputs.interestRate / 100) / 12;
    const numPayments = inputs.pcsTimeframe;
    
    // Monthly mortgage payment (P&I)
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                     (Math.pow(1 + monthlyRate, numPayments) - 1);
    
    // Other monthly costs
    const monthlyPropertyTax = (inputs.homePrice * inputs.propertyTax / 100) / 12;
    const monthlyInsurance = (inputs.homePrice * inputs.homeInsurance / 100) / 12;
    const monthlyMaintenance = inputs.includeMaintenance ? 
                              (inputs.homePrice * inputs.maintenance / 100) / 12 : 0;
    const monthlyUtilities = nationalAverages.housing.utilityAverages.total;
    
    // VA loan specific costs
    const vaFundingFee = inputs.loanType === 'va' && inputs.downPayment === 0 ? 
                        loanAmount * (nationalAverages.vaLoanData.fundingFeeRates.firstTimeNone / 100) : 0;
    const monthlyPMI = inputs.loanType !== 'va' && inputs.downPayment < 20 ? 
                      loanAmount * (nationalAverages.housing.nationalAverages.pmiRate / 100) / 12 : 0;
    
    const totalMonthlyPayment = monthlyPI + monthlyPropertyTax + monthlyInsurance + 
                               monthlyMaintenance + monthlyUtilities + monthlyPMI;
    
    // Calculate total costs over PCS timeframe
    const totalPaid = totalMonthlyPayment * inputs.pcsTimeframe;
    const downPaymentCost = inputs.homePrice * (inputs.downPayment / 100);
    const closingCosts = inputs.homePrice * 0.03; // 3% closing costs
    const initialCosts = downPaymentCost + closingCosts + vaFundingFee;
    
    // Equity and appreciation
    const principalPaydown = calculatePrincipalPaydown(loanAmount, monthlyRate, monthlyPI, inputs.pcsTimeframe);
    const homeValueAtSale = inputs.homePrice * Math.pow(1 + (inputs.homeAppreciation / 100), inputs.pcsTimeframe / 12);
    const appreciation = homeValueAtSale - inputs.homePrice;
    
    // Selling costs
    const sellingCosts = homeValueAtSale * 
                        (nationalAverages.pcsSpecific.sellingCosts.realtorCommission + 
                         nationalAverages.pcsSpecific.sellingCosts.closingCosts + 
                         nationalAverages.pcsSpecific.sellingCosts.repairs) / 100;
    
    const grossEquity = principalPaydown + appreciation;
    const netEquity = grossEquity - sellingCosts;
    const netCost = totalPaid + initialCosts - netEquity;

    return {
      monthlyPayment: totalMonthlyPayment,
      monthlyPI,
      monthlyPropertyTax,
      monthlyInsurance,
      monthlyMaintenance,
      monthlyUtilities,
      monthlyPMI,
      totalPaid,
      initialCosts,
      principalPaydown,
      appreciation,
      sellingCosts,
      netEquity,
      netCost,
      homeValueAtSale
    };
  };

  const calculateRentingScenario = () => {
    let totalRentPaid = 0;
    let currentRent = inputs.rentPrice;
    const monthlyUtilities = nationalAverages.housing.utilityAverages.total * 0.7; // Renters pay less
    const monthlyRentersInsurance = 25;
    
    // Calculate rent with annual increases over PCS timeframe
    for (let month = 0; month < inputs.pcsTimeframe; month++) {
      if (month > 0 && month % 12 === 0) {
        currentRent *= (1 + inputs.rentIncrease / 100);
      }
      totalRentPaid += currentRent + monthlyUtilities + monthlyRentersInsurance;
    }
    
    // Opportunity cost of down payment invested
    const downPaymentAmount = inputs.homePrice * (inputs.downPayment / 100);
    const investmentReturn = 0.07; // 7% average market return
    const opportunityGain = downPaymentAmount * Math.pow(1 + investmentReturn, inputs.pcsTimeframe / 12) - downPaymentAmount;
    
    // Moving costs savings (no selling costs)
    const movingCosts = nationalAverages.pcsSpecific.movingCosts.ppm; // Typical PCS move cost
    
    const netCost = totalRentPaid + movingCosts - opportunityGain;

    return {
      monthlyRent: inputs.rentPrice,
      monthlyUtilities,
      monthlyRentersInsurance,
      totalMonthlyPayment: inputs.rentPrice + monthlyUtilities + monthlyRentersInsurance,
      totalRentPaid,
      opportunityGain,
      movingCosts,
      netCost,
      averageMonthlyRent: totalRentPaid / inputs.pcsTimeframe
    };
  };

  const calculatePrincipalPaydown = (principal, monthlyRate, monthlyPayment, months) => {
    let balance = principal;
    let totalPrincipal = 0;
    
    for (let i = 0; i < months; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      totalPrincipal += principalPayment;
      balance -= principalPayment;
    }
    
    return totalPrincipal;
  };

  useEffect(() => {
    const buying = calculateBuyingScenario();
    const renting = calculateRentingScenario();
    
    const comparison = {
      monthlySavings: renting.totalMonthlyPayment - buying.monthlyPayment,
      totalSavings: renting.netCost - buying.netCost,
      breakEvenMonth: Math.abs((renting.netCost - buying.netCost) / 
                              (renting.totalMonthlyPayment - buying.monthlyPayment)),
      recommendation: renting.netCost < buying.netCost ? 'rent' : 'buy'
    };
    
    setCalculations({ buying, renting, comparison });
  }, [inputs]);

  const pieChartDataBuy = {
    labels: ['Principal & Interest', 'Property Tax', 'Insurance', 'Maintenance', 'Utilities', 'PMI'],
    datasets: [{
      data: [
        calculations.buying.monthlyPI || 0,
        calculations.buying.monthlyPropertyTax || 0,
        calculations.buying.monthlyInsurance || 0,
        calculations.buying.monthlyMaintenance || 0,
        calculations.buying.monthlyUtilities || 0,
        calculations.buying.monthlyPMI || 0
      ],
      backgroundColor: [
        '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const pieChartDataRent = {
    labels: ['Rent', 'Utilities', 'Renters Insurance'],
    datasets: [{
      data: [
        calculations.renting.monthlyRent || 0,
        calculations.renting.monthlyUtilities || 0,
        calculations.renting.monthlyRentersInsurance || 0
      ],
      backgroundColor: [
        '#3b82f6', '#8b5cf6', '#f59e0b'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const barChartData = {
    labels: ['Month 1', `Month ${Math.floor(inputs.pcsTimeframe/2)}`, `Month ${inputs.pcsTimeframe} (PCS)`],
    datasets: [
      {
        label: 'Buying Net Cost',
        data: [
          calculations.buying.monthlyPayment + (calculations.buying.initialCosts / inputs.pcsTimeframe),
          (calculations.buying.netCost / inputs.pcsTimeframe) * (inputs.pcsTimeframe/2),
          calculations.buying.netCost
        ],
        backgroundColor: '#22c55e',
        borderColor: '#16a34a',
        borderWidth: 1
      },
      {
        label: 'Renting Net Cost',
        data: [
          calculations.renting.totalMonthlyPayment,
          (calculations.renting.netCost / inputs.pcsTimeframe) * (inputs.pcsTimeframe/2),
          calculations.renting.netCost
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
        text: 'Buy vs Rent Cost Over PCS Timeframe'
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
          ⚖️ Enhanced Buy vs Rent Analyzer
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Make informed PCS housing decisions with our comprehensive comparison tool 
          that factors in VA loan benefits, equity growth, and military-specific costs.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
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
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$150K</span>
            <span className="font-medium">${inputs.homePrice.toLocaleString()}</span>
            <span>$800K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent
          </label>
          <input
            type="range"
            min="800"
            max="4000"
            step="50"
            value={inputs.rentPrice}
            onChange={(e) => setInputs({...inputs, rentPrice: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$800</span>
            <span className="font-medium">${inputs.rentPrice.toLocaleString()}</span>
            <span>$4K</span>
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
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1 yr</span>
            <span className="font-medium">{inputs.pcsTimeframe} months</span>
            <span>6 yrs</span>
          </div>
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
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>0%</span>
            <span className="font-medium">{inputs.downPayment}%</span>
            <span>25%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Type
          </label>
          <select
            value={inputs.loanType}
            onChange={(e) => setInputs({
              ...inputs, 
              loanType: e.target.value,
              interestRate: e.target.value === 'va' ? 
                nationalAverages.mortgageRates.vaLoan30Year : 
                nationalAverages.mortgageRates.conventional30Year
            })}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="va">VA Loan</option>
            <option value="conventional">Conventional</option>
            <option value="fha">FHA</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interest Rate %
          </label>
          <input
            type="number"
            step="0.1"
            min="3"
            max="10"
            value={inputs.interestRate}
            onChange={(e) => setInputs({...inputs, interestRate: parseFloat(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="includeMaintenance"
            checked={inputs.includeMaintenance}
            onChange={(e) => setInputs({...inputs, includeMaintenance: e.target.checked})}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includeMaintenance" className="ml-2 text-sm font-medium text-gray-700">
            Include Maintenance Costs
          </label>
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
                ${(calculations.buying.monthlyPayment || 0).toLocaleString()}
              </div>
              <div className="text-sm text-green-700">Monthly Payment</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Principal & Interest</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.buying.monthlyPI || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Property Tax</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.buying.monthlyPropertyTax || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Insurance</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.buying.monthlyInsurance || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Utilities</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.buying.monthlyUtilities || 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Monthly Cost Breakdown</div>
            <div className="h-64">
              <Pie data={pieChartDataBuy} options={pieOptions} />
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-green-700">Equity Gained:</span>
              <span className="font-semibold text-green-800">
                ${(calculations.buying.netEquity || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-green-700">Home Value at PCS:</span>
              <span className="font-semibold text-green-800">
                ${(calculations.buying.homeValueAtSale || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span className="text-green-700">Net Cost After PCS:</span>
              <span className="text-green-800">
                ${(calculations.buying.netCost || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* If You Rent Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-blue-800">🏢 If You Rent</h2>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">
                ${(calculations.renting.totalMonthlyPayment || 0).toLocaleString()}
              </div>
              <div className="text-sm text-blue-700">Monthly Payment</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Monthly Rent</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.renting.monthlyRent || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-sm text-gray-600">Utilities</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.renting.monthlyUtilities || 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-white rounded-lg p-3 col-span-2">
              <div className="text-sm text-gray-600">Renters Insurance</div>
              <div className="text-lg font-semibold text-gray-800">
                ${(calculations.renting.monthlyRentersInsurance || 0).toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-600 mb-2">Monthly Cost Breakdown</div>
            <div className="h-64">
              <Pie data={pieChartDataRent} options={pieOptions} />
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Investment Opportunity:</span>
              <span className="font-semibold text-blue-800">
                ${(calculations.renting.opportunityGain || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Flexibility Value:</span>
              <span className="font-semibold text-blue-800">
                Easy PCS Moves
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span className="text-blue-700">Net Cost After PCS:</span>
              <span className="text-blue-800">
                ${(calculations.renting.netCost || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Cost Progression Over PCS Timeframe
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
          💡 PCS Housing Recommendation
        </h3>
        <p className="text-xl mb-4">
          For your {inputs.pcsTimeframe}-month assignment, 
          <span className="font-bold">
            {calculations.comparison.recommendation === 'buy' ? ' BUYING' : ' RENTING'}
          </span> is the better financial choice.
        </p>
        <p className="text-lg">
          {calculations.comparison.recommendation === 'buy' 
            ? `You'll save approximately $${Math.abs(calculations.comparison.totalSavings || 0).toLocaleString()} by buying, considering equity gains and tax benefits.`
            : `You'll save approximately $${Math.abs(calculations.comparison.totalSavings || 0).toLocaleString()} by renting, maintaining flexibility for your next PCS.`
          }
        </p>
        <p className="text-sm mt-2 opacity-90">
          This includes VA loan benefits, equity appreciation, and PCS-specific costs.
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
            localStorage.setItem('buyVsRentScenario', JSON.stringify(scenario));
            alert('Scenario saved to browser storage!');
          }}
        >
          💾 Save Scenario
        </button>
      </div>
    </div>
  );
}

export default BuyVsRentCalculator;
