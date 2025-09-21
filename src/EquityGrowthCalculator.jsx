import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import nationalAverages from './data/nationalAverages.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function EquityGrowthCalculator() {
  const defaults = nationalAverages.phase2Data?.equityGrowth || {};
  const mortgageDefaults = nationalAverages.mortgageRates;
  
  const [inputs, setInputs] = useState({
    homeValue: 350000,
    loanAmount: 300000,
    interestRate: mortgageDefaults.vaLoan30Year || 6.85,
    pcsTimeframe: 36, // months
    appreciationRate: defaults.averageAppreciation || 3.5,
    extraPayment: 0,
    loanTerm: 30, // years
    downPayment: 50000
  });

  const [equityData, setEquityData] = useState({
    monthlyData: [],
    totalEquity: 0,
    principalPaid: 0,
    appreciation: 0,
    monthlyPayment: 0
  });

  const calculateEquityGrowth = () => {
    const monthlyRate = inputs.interestRate / 100 / 12;
    const totalPayments = inputs.loanTerm * 12;
    const monthlyAppreciation = inputs.appreciationRate / 100 / 12;
    
    // Calculate monthly P&I payment
    const monthlyPI = inputs.loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
      (Math.pow(1 + monthlyRate, totalPayments) - 1);
    
    const monthlyPayment = monthlyPI + inputs.extraPayment;
    
    let balance = inputs.loanAmount;
    let homeValue = inputs.homeValue;
    let totalPrincipalPaid = 0;
    const monthlyData = [];
    
    // Calculate equity growth month by month
    for (let month = 0; month <= inputs.pcsTimeframe; month++) {
      if (month > 0) {
        // Calculate interest and principal portions
        const interestPayment = balance * monthlyRate;
        const principalPayment = monthlyPayment - interestPayment;
        
        // Update balance and totals
        balance = Math.max(0, balance - principalPayment);
        totalPrincipalPaid += principalPayment;
        
        // Calculate home appreciation
        homeValue *= (1 + monthlyAppreciation);
      }
      
      const currentEquity = homeValue - balance;
      const appreciation = homeValue - inputs.homeValue;
      
      monthlyData.push({
        month: month,
        homeValue: homeValue,
        loanBalance: balance,
        equity: currentEquity,
        principalPaid: totalPrincipalPaid,
        appreciation: appreciation,
        monthlyPayment: month === 0 ? 0 : monthlyPayment
      });
    }
    
    const finalData = monthlyData[monthlyData.length - 1];
    
    setEquityData({
      monthlyData,
      totalEquity: finalData.equity,
      principalPaid: finalData.principalPaid,
      appreciation: finalData.appreciation,
      monthlyPayment: monthlyPayment
    });
  };

  useEffect(() => {
    calculateEquityGrowth();
  }, [inputs]);

  // Prepare chart data
  const lineChartData = {
    labels: equityData.monthlyData.map(d => `Month ${d.month}`).filter((_, i) => i % 6 === 0), // Show every 6 months
    datasets: [
      {
        label: 'Total Equity',
        data: equityData.monthlyData.filter((_, i) => i % 6 === 0).map(d => d.equity),
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Principal Paid Down',
        data: equityData.monthlyData.filter((_, i) => i % 6 === 0).map(d => d.principalPaid),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      },
      {
        label: 'Home Appreciation',
        data: equityData.monthlyData.filter((_, i) => i % 6 === 0).map(d => d.appreciation),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }
    ]
  };

  const barChartData = {
    labels: ['Current', `Year 1`, `Year 2`, `PCS (${Math.floor(inputs.pcsTimeframe/12)}y ${inputs.pcsTimeframe%12}m)`],
    datasets: [
      {
        label: 'Down Payment',
        data: [inputs.downPayment, inputs.downPayment, inputs.downPayment, inputs.downPayment],
        backgroundColor: '#8b5cf6',
        borderColor: '#7c3aed',
        borderWidth: 1
      },
      {
        label: 'Principal Paid',
        data: [
          0,
          equityData.monthlyData[12]?.principalPaid || 0,
          equityData.monthlyData[24]?.principalPaid || 0,
          equityData.principalPaid
        ],
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        borderWidth: 1
      },
      {
        label: 'Appreciation',
        data: [
          0,
          equityData.monthlyData[12]?.appreciation || 0,
          equityData.monthlyData[24]?.appreciation || 0,
          equityData.appreciation
        ],
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
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
        text: 'Equity Growth Over PCS Timeline'
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + (value/1000).toFixed(0) + 'K';
          }
        }
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          📈 Equity Growth Calculator
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Track your home equity growth during PCS assignments and see the impact 
          of appreciation and principal paydown over time.
        </p>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Home Value
          </label>
          <input
            type="range"
            min="200000"
            max="800000"
            step="10000"
            value={inputs.homeValue}
            onChange={(e) => setInputs({
              ...inputs, 
              homeValue: parseInt(e.target.value),
              loanAmount: parseInt(e.target.value) - inputs.downPayment
            })}
            className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$200K</span>
            <span className="font-medium">${inputs.homeValue.toLocaleString()}</span>
            <span>$800K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Down Payment
          </label>
          <input
            type="range"
            min="0"
            max="200000"
            step="5000"
            value={inputs.downPayment}
            onChange={(e) => setInputs({
              ...inputs, 
              downPayment: parseInt(e.target.value),
              loanAmount: inputs.homeValue - parseInt(e.target.value)
            })}
            className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.downPayment.toLocaleString()}</span>
            <span>$200K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PCS Timeline (months)
          </label>
          <input
            type="range"
            min="12"
            max="72"
            step="6"
            value={inputs.pcsTimeframe}
            onChange={(e) => setInputs({...inputs, pcsTimeframe: parseInt(e.target.value)})}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1yr</span>
            <span className="font-medium">{inputs.pcsTimeframe}m</span>
            <span>6yrs</span>
          </div>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Appreciation Rate %
          </label>
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={inputs.appreciationRate}
            onChange={(e) => setInputs({...inputs, appreciationRate: parseFloat(e.target.value)})}
            className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>1%</span>
            <span className="font-medium">{inputs.appreciationRate}%</span>
            <span>8%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Extra Monthly Payment
          </label>
          <input
            type="range"
            min="0"
            max="1000"
            step="50"
            value={inputs.extraPayment}
            onChange={(e) => setInputs({...inputs, extraPayment: parseInt(e.target.value)})}
            className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>$0</span>
            <span className="font-medium">${inputs.extraPayment}</span>
            <span>$1K</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Term (years)
          </label>
          <select
            value={inputs.loanTerm}
            onChange={(e) => setInputs({...inputs, loanTerm: parseInt(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value={15}>15 Years</option>
            <option value={30}>30 Years</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              ${Math.round(equityData.totalEquity).toLocaleString()}
            </div>
            <div className="text-sm text-green-700">Total Equity at PCS</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              ${Math.round(equityData.principalPaid).toLocaleString()}
            </div>
            <div className="text-sm text-blue-700">Principal Paid Down</div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              ${Math.round(equityData.appreciation).toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700">Home Appreciation</div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              ${Math.round(equityData.monthlyPayment).toLocaleString()}
            </div>
            <div className="text-sm text-purple-700">Monthly Payment</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Line Chart - Equity Growth Over Time */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Equity Growth Timeline
          </h3>
          <div className="h-80">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Bar Chart - Equity Components */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            Equity Building Components
          </h3>
          <div className="h-80">
            <Bar data={barChartData} options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  display: true,
                  text: 'Equity Sources Over Time'
                }
              },
              scales: {
                ...chartOptions.scales,
                x: {
                  stacked: true
                },
                y: {
                  ...chartOptions.scales.y,
                  stacked: true
                }
              }
            }} />
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          📊 Equity Growth Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="text-lg font-semibold text-blue-600 mb-2">Principal Contribution</div>
            <div className="text-sm text-gray-600">
              {((equityData.principalPaid / equityData.totalEquity) * 100 || 0).toFixed(1)}% 
              of equity from loan paydown
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600 mb-2">Appreciation Contribution</div>
            <div className="text-sm text-gray-600">
              {((equityData.appreciation / equityData.totalEquity) * 100 || 0).toFixed(1)}% 
              of equity from market growth
            </div>
          </div>
          <div>
            <div className="text-lg font-semibold text-green-600 mb-2">Annual Equity Growth</div>
            <div className="text-sm text-gray-600">
              ${Math.round((equityData.totalEquity - inputs.downPayment) / (inputs.pcsTimeframe / 12)).toLocaleString()} 
              per year average
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquityGrowthCalculator;