import React from 'react';

const HeroSection = ({ onCalculatorSelect, selectedCalculator }) => {
  const calculators = [
    // Phase 1: Military Basics
    { 
      id: 'pcs-deduction', 
      name: 'PCS Deduction', 
      icon: '🎖️', 
      description: 'Tax deduction analysis for PCS moves and military relocations',
      phase: 1
    },
    { 
      id: 'mortgage', 
      name: 'VA Mortgage', 
      icon: '🏠', 
      description: 'Calculate VA loan payments with zero down payment benefits',
      phase: 1
    },
    { 
      id: 'rent', 
      name: 'Rent Analysis', 
      icon: '🏢', 
      description: 'Military rental cost analysis with BAH optimization',
      phase: 1
    },
    { 
      id: 'buyvsrent', 
      name: 'Buy vs Rent', 
      icon: '⚖️', 
      description: 'PCS move decisions: Buy vs rent financial calculator',
      phase: 1
    },
    { 
      id: 'bah', 
      name: 'BAH Calculator', 
      icon: '💰', 
      description: 'Basic Allowance for Housing optimization tool',
      phase: 1
    },
    { 
      id: 'property-tax', 
      name: 'Property Tax', 
      icon: '📊', 
      description: 'Military property tax calculator with exemptions',
      phase: 1
    },
    
    // Phase 2: Real Estate & Investment
    { 
      id: 'equity-growth', 
      name: 'Equity Growth', 
      icon: '📈', 
      description: 'Track home equity growth during PCS assignments',
      phase: 2
    },
    { 
      id: 'landlord-profit', 
      name: 'Landlord Profit', 
      icon: '🏠', 
      description: 'Rental property profitability analysis for military investors',
      phase: 2
    },
    { 
      id: 'refinance-vs-sell', 
      name: 'Refinance vs Sell', 
      icon: '🏠↔️', 
      description: 'Compare refinancing vs selling when you PCS',
      phase: 2
    },
    { 
      id: 'dti-bah', 
      name: 'DTI + BAH', 
      icon: '💰📊', 
      description: 'Debt-to-income analysis with military pay optimization',
      phase: 2
    },
    
    // Phase 3: Tax & Retirement Planning
    { 
      id: 'capital-gains', 
      name: 'Capital Gains', 
      icon: '📊💰', 
      description: 'Primary residence capital gains exclusion with PCS extensions',
      phase: 3
    },
    { 
      id: 'depreciation', 
      name: 'Depreciation', 
      icon: '🏠📉', 
      description: 'Rental property depreciation recapture tax calculator',
      phase: 3
    },
    { 
      id: 'tsp-retirement', 
      name: 'TSP & Retirement', 
      icon: '💰🎖️', 
      description: 'Military retirement and TSP growth projections over 20+ years',
      phase: 3
    },
    { 
      id: 'sbp-insurance', 
      name: 'SBP vs Insurance', 
      icon: '🛡️💰', 
      description: 'Survivor Benefit Plan vs life insurance cost analysis',
      phase: 3
    },
    { 
      id: 'gi-bill', 
      name: 'GI Bill Housing', 
      icon: '🎓💰', 
      description: 'GI Bill housing stipend estimator and benefit optimizer',
      phase: 3
    },
  ];

  return (
    <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-4" role="main">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Minimal Hero Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Military Financial Calculators
            <span className="text-blue-600 block text-sm font-normal mt-1">
              by MustWants & MilitaryGrad
            </span>
          </h1>
        </div>

        {/* Calculator Selection - Above the Fold */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-center text-gray-800 mb-3">
            Choose Your Calculator:
          </h2>
        </div>

        {/* Calculator Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3" role="tablist">
          {calculators.map((calc, index) => (
            <div
              key={calc.id}
              onClick={() => onCalculatorSelect(index)}
              className={`cursor-pointer group relative overflow-hidden rounded-lg p-3 transition-all duration-300 ${
                selectedCalculator === index
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white hover:bg-blue-50 hover:shadow-md hover:scale-102 text-gray-900'
              }`}
              role="tab"
              aria-selected={selectedCalculator === index}
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onCalculatorSelect(index);
                }
              }}
            >
              {/* Calculator Icon */}
              <div className="text-center">
                <div className={`text-2xl mb-1 ${selectedCalculator === index ? 'text-white' : 'text-blue-600'}`}>
                  {calc.icon}
                </div>
                <h3 className="font-semibold text-xs mb-1">{calc.name}</h3>
              </div>

              {/* Active Indicator */}
              {selectedCalculator === index && (
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" aria-label="Active calculator"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Minimal Trust Indicators */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            🏆 SDVOSB
          </span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            🇺🇸 Veteran Owned
          </span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            📌 MustWants
          </span>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;