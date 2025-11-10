// Central registry: categories, slugs, and component loaders.
// Hook your existing calculators and ship placeholders for the rest.

import React from "react";

// Lazy loaders for calculators you already have:
const MortgageCalculator = React.lazy(() => import("../MortgageCalculator.jsx"));
const DTIBAHCalculator = React.lazy(() => import("../DTIBAHCalculator.jsx"));
const EquityGrowthCalculator = React.lazy(() => import("../EquityGrowthCalculator.jsx"));
const GIBillHousingStipendEstimator = React.lazy(() => import("../GIBillHousingStipendEstimator.jsx"));
const MSRRAIncomeTaxEstimator = React.lazy(() => import("../MSRRAIncomeTaxEstimator.jsx"));
const PCSDeductionCalculator = React.lazy(() => import("../PCSDeductionCalculator.jsx"));
const LandlordProfitabilityTool = React.lazy(() => import("../LandlordProfitabilityTool.jsx"));
const MilitaryRetTaxImpactCalculator = React.lazy(() => import("../MilitaryRetTaxImpactCalculator.jsx"));

// Generic placeholder for calculators not yet implemented
const Placeholder = React.lazy(() => import("./support/PlaceholderCalculator.jsx"));

export const CATEGORIES = [
  "All",
  "Retirement",
  "Investment",
  "Saving for College",
  "Estate",
  "Insurance",
  "Tax",
  "Money",
  "Lifestyle",
  "Home",
];

export const CALCULATORS = [
  // Home / already built
  { title: "Mortgage Calculator", slug: "mortgage", category: "Home", component: MortgageCalculator, tags: ["VA", "PMI", "Escrows"] },
  { title: "DTI + BAH Calculator", slug: "dti-bah", category: "Home", component: DTIBAHCalculator, tags: ["BAH", "BAS", "DTI"] },
  { title: "Equity Growth", slug: "equity-growth", category: "Home", component: EquityGrowthCalculator, tags: ["Amortization", "LTV"] },
  { title: "Landlord Profitability", slug: "landlord-profitability", category: "Home", component: LandlordProfitabilityTool, tags: ["NOI", "CapRate", "DSCR"] },

  // Military / tax suite already built
  { title: "MSRRA Income Tax Estimator", slug: "msrra-tax", category: "Tax", component: MSRRAIncomeTaxEstimator, tags: ["State", "Spouse"] },
  { title: "Military Retirement: State Tax Impact", slug: "mil-ret-tax-impact", category: "Tax", component: MilitaryRetTaxImpactCalculator, tags: ["SBP", "Wages"] },
  { title: "PCS Deduction Calculator (Buy vs Rent)", slug: "pcs-deduction", category: "Home", component: PCSDeductionCalculator, tags: ["PCS", "Taxes"] },
  { title: "GI Bill Housing Stipend", slug: "gi-bill-housing", category: "Money", component: GIBillHousingStipendEstimator, tags: ["MHA"] },

  // Retirement
  { title: "A Look at Systematic Withdrawals", slug: "systematic-withdrawals", category: "Retirement", component: Placeholder },
  { title: "Saving for Retirement", slug: "saving-for-retirement", category: "Retirement", component: Placeholder },
  { title: "My Retirement Savings", slug: "my-retirement-savings", category: "Retirement", component: Placeholder },
  { title: "Roth 401(k) vs. Traditional 401(k)", slug: "roth-vs-traditional-401k", category: "Retirement", component: Placeholder },
  { title: "Inflation & Retirement", slug: "inflation-and-retirement", category: "Retirement", component: Placeholder },
  { title: "Potential Income from an IRA", slug: "potential-income-ira", category: "Retirement", component: Placeholder },
  { title: "Estimate Your RMD", slug: "estimate-rmd", category: "Retirement", component: Placeholder },
  { title: "Self-Employed Retirement Plans", slug: "self-employed-retirement", category: "Retirement", component: Placeholder },
  { title: "Annuity Comparison", slug: "annuity-comparison", category: "Retirement", component: Placeholder },

  // Investment
  { title: "Taxable vs. Tax-Deferred Savings", slug: "taxable-vs-tax-deferred", category: "Investment", component: Placeholder },
  { title: "How Compound Interest Works", slug: "compound-interest", category: "Investment", component: Placeholder },
  { title: "What Is My Risk Tolerance?", slug: "risk-tolerance", category: "Investment", component: Placeholder },
  { title: "What Is the Dividend Yield?", slug: "dividend-yield", category: "Investment", component: Placeholder },
  { title: "Impact of Taxes and Inflation", slug: "taxes-and-inflation", category: "Investment", component: Placeholder },

  // Saving for College
  { title: "Contributing to an IRA?", slug: "contributing-ira", category: "Saving for College", component: Placeholder }, // left as provided
  // Estate
  { title: "What Is My Life Expectancy?", slug: "life-expectancy", category: "Estate", component: Placeholder },
  { title: "What Is My Current Net Worth?", slug: "net-worth", category: "Estate", component: Placeholder },
  { title: "What’s My Potential Estate Tax?", slug: "estate-tax", category: "Estate", component: Placeholder },

  // Insurance
  { title: "Assess Your Life Insurance Needs", slug: "life-insurance-needs", category: "Insurance", component: Placeholder },
  { title: "Lifetime of Earnings", slug: "lifetime-earnings", category: "Insurance", component: Placeholder },
  { title: "Disability Income", slug: "disability-income", category: "Insurance", component: Placeholder },
  { title: "Long-Term-Care Needs", slug: "long-term-care", category: "Insurance", component: Placeholder },

  // Tax
  { title: "Federal Income Tax", slug: "federal-income-tax", category: "Tax", component: Placeholder },
  { title: "Capital Gains Tax Estimator", slug: "capital-gains-tax", category: "Tax", component: Placeholder },
  { title: "Comparing Investments", slug: "comparing-investments", category: "Tax", component: Placeholder },
  { title: "Social Security Taxes", slug: "social-security-taxes", category: "Tax", component: Placeholder },
  { title: "Tax Freedom Day", slug: "tax-freedom-day", category: "Tax", component: Placeholder },
  { title: "Home Mortgage Deduction", slug: "home-mortgage-deduction", category: "Tax", component: Placeholder },

  // Money
  { title: "What Is My Current Cash Flow?", slug: "cash-flow", category: "Money", component: Placeholder },
  { title: "Historical Inflation", slug: "historical-inflation", category: "Money", component: Placeholder },
  { title: "Paying Off a Credit Card", slug: "paying-off-credit-card", category: "Money", component: Placeholder },

  // Lifestyle
  { title: "Interested in a Fuel Efficient Car?", slug: "fuel-efficient-car", category: "Lifestyle", component: Placeholder },
  { title: "Should I Buy or Lease an Auto?", slug: "buy-or-lease", category: "Lifestyle", component: Placeholder },
  { title: "Should I Pay Off Debt or Invest?", slug: "pay-debt-or-invest", category: "Lifestyle", component: Placeholder },
  { title: "How Much Home Can I Afford?", slug: "home-affordability", category: "Lifestyle", component: Placeholder },
  { title: "Can I Refinance My Mortgage?", slug: "refinance-mortgage", category: "Lifestyle", component: Placeholder },
  { title: "Comparing Mortgage Terms", slug: "comparing-mortgage-terms", category: "Lifestyle", component: Placeholder },
  { title: "Bi-Weekly Payments", slug: "bi-weekly-payments", category: "Lifestyle", component: Placeholder },
];
