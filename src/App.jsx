
import React, { useState } from 'react';
import Header from './Header';
import HeroSection from './HeroSection';
import MortgageCalculator from './MortgageCalculator';
import RentCalculator from './RentCalculator';
import BuyVsRentCalculator from './BuyVsRentCalculator';
import BAHCalculator from './BAHCalculator';
import PropertyTaxCalculator from './PropertyTaxCalculator';
import PCSDeductionCalculator from './PCSDeductionCalculator';
import { ErrorBoundary } from './ErrorBoundary';

const calculators = [
  { name: 'PCS Deduction', component: PCSDeductionCalculator, icon: '🎖️' },
  { name: 'VA Mortgage', component: MortgageCalculator, icon: '🏠' },
  { name: 'Rent Analysis', component: RentCalculator, icon: '🏢' },
  { name: 'Buy vs Rent', component: BuyVsRentCalculator, icon: '⚖️' },
  { name: 'BAH Calculator', component: BAHCalculator, icon: '💰' },
  { name: 'Property Tax', component: PropertyTaxCalculator, icon: '📊' },
];

function App() {
  const [selected, setSelected] = useState(0);
  const SelectedComponent = calculators[selected].component;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section with Calculator Selection */}
      <HeroSection 
        onCalculatorSelect={setSelected}
        selectedCalculator={selected}
      />
      
      {/* Calculator Content */}
      <main role="main" className="pb-12">
        <ErrorBoundary>
          <SelectedComponent />
        </ErrorBoundary>
      </main>

      {/* SEO Content Section */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose VetMover by MustWants?
            </h2>
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

      {/* Footer */}
      <footer className="bg-gradient-to-b from-blue-900 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">VetMover</h3>
              <p className="text-blue-200 text-sm mb-4">
                Empowering military families with financial tools for informed real estate decisions.
              </p>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs bg-blue-700 px-2 py-1 rounded">📌 MustWants Pin Logo</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-green-700 px-2 py-1 rounded">🏆 SDVOSB Certified</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="https://mustwants.com/about" className="hover:text-white flex items-center">👥 About Us</a></li>
                <li><a href="https://mustwants.com/policies" className="hover:text-white flex items-center">📋 Policies</a></li>
                <li><a href="https://mustwants.com/podcast" className="hover:text-white flex items-center">🎧 Listen to Our Podcast</a></li>
                <li><a href="https://mustwants.com/app" className="hover:text-white flex items-center">📱 Download Our App</a></li>
                <li><a href="https://mustwants.com/admin" className="hover:text-white flex items-center">⚙️ Admin</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Military Resources</h3>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white">🏠 VA Loan Benefits</a></li>
                <li><a href="#" className="hover:text-white">📦 PCS Planning Guide</a></li>
                <li><a href="#" className="hover:text-white">💰 BAH Calculator</a></li>
                <li><a href="#" className="hover:text-white">🏘️ Military Housing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="space-y-3 text-sm mb-4">
                <a href="https://mustwants.com" target="_blank" rel="noopener noreferrer" 
                   className="block text-blue-200 hover:text-white">
                  🔗 MustWants.com
                </a>
                <a href="https://militarygrad.com" target="_blank" rel="noopener noreferrer" 
                   className="block text-blue-200 hover:text-white">
                  🎓 MilitaryGrad.com
                </a>
              </div>
              
              <h4 className="text-sm font-semibold mb-3">Follow Us</h4>
              <div className="grid grid-cols-3 gap-2">
                <a href="https://facebook.com/mustwants" target="_blank" rel="noopener noreferrer" 
                   className="bg-blue-600 hover:bg-blue-500 p-2 rounded text-center transition-colors" title="Facebook">
                  📘
                </a>
                <a href="https://instagram.com/mustwants" target="_blank" rel="noopener noreferrer" 
                   className="bg-pink-600 hover:bg-pink-500 p-2 rounded text-center transition-colors" title="Instagram">
                  📷
                </a>
                <a href="https://twitter.com/mustwants" target="_blank" rel="noopener noreferrer" 
                   className="bg-gray-800 hover:bg-gray-700 p-2 rounded text-center transition-colors" title="Twitter/X">
                  ❌
                </a>
                <a href="https://linkedin.com/company/mustwants" target="_blank" rel="noopener noreferrer" 
                   className="bg-blue-700 hover:bg-blue-600 p-2 rounded text-center transition-colors" title="LinkedIn">
                  💼
                </a>
                <a href="https://youtube.com/mustwants" target="_blank" rel="noopener noreferrer" 
                   className="bg-red-600 hover:bg-red-500 p-2 rounded text-center transition-colors" title="YouTube">
                  📺
                </a>
                <a href="https://bsky.app/profile/mustwants" target="_blank" rel="noopener noreferrer" 
                   className="bg-sky-600 hover:bg-sky-500 p-2 rounded text-center transition-colors" title="BlueSky">
                  🦋
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-blue-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <p className="text-sm text-blue-200">
                  &copy; 2025 <strong>VetMover</strong>™ - Sponsored by 
                  <a href="https://mustwants.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-100 underline ml-1">
                    MustWants.com
                  </a>
                </p>
                <p className="text-xs text-blue-300 mt-1">
                  VetMover™ is a trademark of MustWants. Built for military families, by military families. 🇺🇸
                </p>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-blue-300">
                <span className="bg-blue-700 px-3 py-1 rounded-full">📌 MustWants Pin</span>
                <span className="bg-green-700 px-3 py-1 rounded-full">🏆 SDVOSB</span>
                <span className="bg-red-700 px-3 py-1 rounded-full">🇺🇸 Veteran Owned</span>
              </div>
            </div>
            
            <div className="text-center mt-6 pt-4 border-t border-blue-800">
              <p className="text-xs text-blue-400">
                Powered by <a href="https://mustwants.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-100 underline">MustWants.com</a> - 
                Your trusted partner in military financial planning and real estate decisions.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

