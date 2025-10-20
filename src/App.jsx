import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Header from './Header';
import HeroSection from './HeroSection';
import MortgageCalculator from './MortgageCalculator';
import RentCalculator from './RentCalculator';
import BuyVsRentCalculator from './BuyVsRentCalculator';
import BAHCalculator from './BAHCalculator';
import PropertyTaxCalculator from './PropertyTaxCalculator';
import PCSDeductionCalculator from './PCSDeductionCalculator';
import EquityGrowthCalculator from './EquityGrowthCalculator';
import LandlordProfitabilityTool from './LandlordProfitabilityTool';
import RefinanceVsPCSSellTool from './RefinanceVsPCSSellTool';
import DTIBAHCalculator from './DTIBAHCalculator';
import CapitalGainsExclusionCalculator from './CapitalGainsExclusionCalculator';
import DepreciationRecaptureEstimator from './DepreciationRecaptureEstimator';
import MilitaryRetirementTSPTool from './MilitaryRetirementTSPTool';
import SBPVsLifeInsuranceCalculator from './SBPVsLifeInsuranceCalculator';
import GIBillHousingStipendEstimator from './GIBillHousingStipendEstimator';
import SBPDecisionCalculator from './SBPDecisionCalculator';

// newly added tools
import PCSStateTaxImpactCalculator from './PCSStateTaxImpactCalculator';
import MilitaryRetTaxImpactCalculator from './MilitaryRetTaxImpactCalculator';
import DisabledVetPropertyTaxReliefEstimator from './DisabledVetPropertyTaxReliefEstimator';
import MSRRAIncomeTaxEstimator from './MSRRAIncomeTaxEstimator';

import CalculatorsRouter from './calculators/Router.jsx';
import { ErrorBoundary } from './ErrorBoundary';

const calculators = [
  { name: 'PCS Deduction', component: PCSDeductionCalculator, icon: '🎖️', phase: 1 },
  { name: 'VA Mortgage', component: MortgageCalculator, icon: '🏠', phase: 1 },
  { name: 'Rent Analysis', component: RentCalculator, icon: '🏢', phase: 1 },
  { name: 'Buy vs Rent', component: BuyVsRentCalculator, icon: '⚖️', phase: 1 },
  { name: 'BAH Calculator', component: BAHCalculator, icon: '💰', phase: 1 },
  { name: 'Property Tax', component: PropertyTaxCalculator, icon: '📊', phase: 1 },
  { name: 'Equity Growth', component: EquityGrowthCalculator, icon: '📈', phase: 2 },
  { name: 'Landlord Profit', component: LandlordProfitabilityTool, icon: '🏠', phase: 2 },
  { name: 'Refinance vs Sell', component: RefinanceVsPCSSellTool, icon: '🏠↔️', phase: 2 },
  { name: 'DTI + BAH', component: DTIBAHCalculator, icon: '💰📊', phase: 2 },
  { name: 'Capital Gains', component: CapitalGainsExclusionCalculator, icon: '📊💰', phase: 3 },
  { name: 'Depreciation', component: DepreciationRecaptureEstimator, icon: '🏠📉', phase: 3 },
  { name: 'TSP & Retirement', component: MilitaryRetirementTSPTool, icon: '💰🎖️', phase: 3 },
  { name: 'SBP vs Insurance', component: SBPVsLifeInsuranceCalculator, icon: '🛡️💰', phase: 3 },
  { name: 'GI Bill Housing', component: GIBillHousingStipendEstimator, icon: '🎓💰', phase: 3 },
  { name: 'SBP Decision', component: SBPDecisionCalculator, icon: '🛡️', phase: 3 },
  { name: 'PCS State Tax Impact', component: PCSStateTaxImpactCalculator, icon: '🧾', phase: 4 },
  { name: 'Military Ret Tax Impact', component: MilitaryRetTaxImpactCalculator, icon: '🧮', phase: 4 },
  { name: 'Disabled Vet Prop-Tax Relief', component: DisabledVetPropertyTaxReliefEstimator, icon: '🏡', phase: 4 },
  { name: 'MSRRA Income Tax', component: MSRRAIncomeTaxEstimator, icon: '📑', phase: 4 },
];

// Home screen = your current single-page UI
function Home() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = calculators[selected].component;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <HeroSection onCalculatorSelect={setSelected} selectedCalculator={selected} />

      <main role="main" className="pt-2 pb-12">
        <ErrorBoundary>
          <SelectedComponent />
        </ErrorBoundary>
      </main>

      <section className="bg-white py-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Military-Focused Financial Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built by veterans for military families making PCS moves and housing decisions.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">50</div>
              <div className="text-sm text-gray-600">States Supported</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-gray-600">Military Focused</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">Free</div>
              <div className="text-sm text-gray-600">Always Free</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full">
              <span role="img" aria-label="checkmark">✅</span>
              <span>VA Loan Optimized</span>
            </span>
            <span className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full">
              <span role="img" aria-label="checkmark">✅</span>
              <span>BAH Integrated</span>
            </span>
            <span className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full">
              <span role="img" aria-label="checkmark">✅</span>
              <span>PCS Ready</span>
            </span>
            <span className="flex items-center space-x-1 bg-gray-50 px-3 py-1 rounded-full">
              <span role="img" aria-label="checkmark">✅</span>
              <span>SDVOSB Certified</span>
            </span>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose VetMover by MustWants?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              SDVOSB certified financial tools designed specifically for military families,
              veterans, and active duty personnel making PCS moves and housing decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🎖️ Military Expertise</h3>
              <p className="text-gray-600">
                Built by veterans for veterans. Our SDVOSB certified team understands
                VA loans, BAH, PCS moves, and military housing allowances.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">📊 Accurate Calculations</h3>
              <p className="text-gray-600">
                Pre-populated with national averages and updated military pay scales.
                Get precise calculations for VA mortgage, rent analysis, and property taxes.
              </p>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">🔒 Trusted Partner</h3>
              <p className="text-gray-600">
                Sponsored by MustWants.com and verified by MilitaryGrad.
                Free tools with no hidden fees or data collection.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-12">
        {/* footer content unchanged */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* … all your existing footer markup … */}
          <div className="text-center mt-6 pt-4 border-t border-blue-800">
            <p className="text-xs text-blue-400">
              Powered by <a href="https://mustwants.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-100 underline">MustWants.com</a> -
              Your trusted partner in military financial planning and real estate decisions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home = current UI */}
        <Route path="/" element={<Home />} />

        {/* Financial calculators suite */}
        <Route path="/calculators/*" element={<CalculatorsRouter />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
