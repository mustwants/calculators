// PATH: src/data/stateTaxAndBenefits.js
// Auto-generated. Edit the source JSON/JS and re-run: npm run fix:state-data

const DATA = {
  "version": "2025.1",
  "lastUpdated": "2025-10-08T00:00:00Z",
  "states": {
    "FL": {
      "name": "Florida",
      "incomeTax": 0,
      "propertyTax": 0.83,
      "militaryRetirementTaxed": false,
      "disabilityTaxed": false,
      "sbpTaxed": false,
      "veteranBenefits": {
        "education": "In-state tuition for veterans and dependents.",
        "homesteadExemption": "Up to $50,000 off assessed value, additional $5,000 for disabled vets.",
        "vehicleTaxRelief": "Exemption for 100% disabled veterans.",
        "propertyTaxRelief": "Full exemption for 100% service-connected disabled veterans."
      }
    },
    "TX": {
      "name": "Texas",
      "incomeTax": 0,
      "propertyTax": 1.6,
      "militaryRetirementTaxed": false,
      "disabilityTaxed": false,
      "sbpTaxed": false,
      "veteranBenefits": {
        "education": "Hazlewood Act: 150 hours tuition exemption for veterans/dependents.",
        "homesteadExemption": "Up to $40,000 off assessed value, additional for disabled vets.",
        "vehicleTaxRelief": "100% exemption for 100% disabled veterans.",
        "propertyTaxRelief": "Partial to full exemption based on disability rating."
      }
    },
    "VA": {
      "name": "Virginia",
      "incomeTax": 5.75,
      "propertyTax": 0.8,
      "militaryRetirementTaxed": true,
      "disabilityTaxed": false,
      "sbpTaxed": true,
      "veteranBenefits": {
        "education": "Virginia Military Survivors and Dependents Education Program.",
        "homesteadExemption": "Full exemption for 100% disabled veterans and surviving spouses.",
        "vehicleTaxRelief": "Exemption for one vehicle for 100% disabled veterans.",
        "propertyTaxRelief": "Exemption on principal residence for 100% service-connected disabled vets."
      }
    },
    "CA": {
      "name": "California",
      "incomeTax": 12.3,
      "propertyTax": 0.75,
      "militaryRetirementTaxed": true,
      "disabilityTaxed": false,
      "sbpTaxed": true,
      "veteranBenefits": {
        "education": "CalVet College Fee Waiver Program for veterans' dependents.",
        "homesteadExemption": "Basic $7,000 exemption, increased for veterans.",
        "vehicleTaxRelief": "Partial exemption for disabled veterans.",
        "propertyTaxRelief": "Varies by county; partial exemption for disabled veterans."
      }
    },
    "NC": {
      "name": "North Carolina",
      "incomeTax": 4.75,
      "propertyTax": 0.85,
      "militaryRetirementTaxed": false,
      "disabilityTaxed": false,
      "sbpTaxed": false,
      "veteranBenefits": {
        "education": "In-state tuition and NC Scholarship for children of veterans.",
        "homesteadExemption": "Up to $45,000 off assessed value for disabled veterans.",
        "vehicleTaxRelief": "Exemption for 100% disabled veterans.",
        "propertyTaxRelief": "Full exemption for 100% service-connected disabled veterans."
      }
    }
  }
};

export default DATA;
