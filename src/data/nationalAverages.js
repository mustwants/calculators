export const nationalAverages = 
{
  "lastUpdated": "2025-09-21",
  "sources": {
    "hudRent": "HUD Fair Market Rent 2025",
    "propertyTax": "Tax Foundation Property Tax Analysis",
    "mortgageRates": "Freddie Mac Primary Mortgage Market Survey",
    "maintenance": "National Association of Home Builders",
    "utilities": "U.S. Energy Information Administration",
    "vaLoan": "VA Lender Handbook",
    "bah": "DoD BAH Calculator 2025"
  },
  "housing": {
    "nationalAverages": {
      "propertyTaxRate": 1.1,
      "homeMaintenancePercent": 1.0,
      "homeInsuranceRate": 0.35,
      "pmiRate": 0.5,
      "vacancyRate": 6.5,
      "appreciationRate": 3.5,
      "inflationRate": 2.8,
      "rentalVacancyRate": 6.8,
      "propertyManagementFee": 8.0,
      "capitalExReserve": 5.0,
      "tenantTurnoverCost": 1500
    },
    "rentByBedrooms": {
      "studio": 1250,
      "oneBedroom": 1450,
      "twoBedroom": 1750,
      "threeBedroom": 2100,
      "fourBedroom": 2500,
      "fivePlusBedroom": 2950
    },
    "utilityAverages": {
      "electric": 125,
      "gas": 85,
      "water": 45,
      "internet": 65,
      "total": 320
    }
  },
  "mortgageRates": {
    "conventional30Year": 7.25,
    "conventional15Year": 6.75,
    "vaLoan30Year": 6.85,
    "vaLoan15Year": 6.35,
    "jumboLoan": 7.45,
    "fhaLoan": 7.15,
    "refinanceRate": 7.1,
    "cashOutRefinance": 7.35
  },
  "phase2Data": {
    "rentalProperty": {
      "managementFeeRange": {
        "min": 6,
        "max": 12,
        "average": 8
      },
      "vacancyRateRange": {
        "min": 4,
        "max": 10,
        "average": 6.8
      },
      "maintenanceReserve": 1.5,
      "capExReserve": 1.0,
      "tenantScreeningCost": 50,
      "averageTenantTurnover": 18,
      "evictionCost": 3500,
      "marketingCost": 200
    },
    "refinancing": {
      "closingCostPercent": 2.5,
      "appraisalCost": 500,
      "titleInsurance": 1200,
      "origination": 1.0,
      "breakEvenMonths": 24,
      "rateDifferenceThreshold": 0.75
    },
    "equityGrowth": {
      "averageAppreciation": 3.5,
      "appreciationRange": {
        "min": 2,
        "max": 6
      },
      "paydownAcceleration": 1.2,
      "marketCycleDuration": 84
    },
    "dtiCalculations": {
      "maxConventionalDTI": 43,
      "maxVADTI": 41,
      "maxFHADTI": 50,
      "conservativeDTI": 36,
      "housingRatioMax": 28,
      "vaResidualIncomeMinimum": 1000
    }
  },
  "vaLoanData": {
    "fundingFeeRates": {
      "firstTimeNone": 2.15,
      "firstTime5Percent": 1.5,
      "firstTime10Percent": 1.25,
      "subsequentNone": 3.3,
      "subsequent5Percent": 1.5,
      "subsequent10Percent": 1.25,
      "irrrlRefinance": 0.5
    },
    "loanLimits": {
      "conformingLimit": 766200,
      "highCostAreaLimit": 1149825,
      "noDownPaymentLimit": 766200
    },
    "exemptions": {
      "disabilityExempt": true,
      "purpleHeartExempt": true,
      "survivingSpouseExempt": true
    }
  },
  "pcsSpecific": {
    "averagePcsCycle": 36,
    "movingCosts": {
      "ppm": 15000,
      "governmentMove": 8000,
      "temporaryLodging": 3500,
      "househunting": 2500
    },
    "sellingCosts": {
      "realtorCommission": 6.0,
      "closingCosts": 1.5,
      "repairs": 2.0,
      "staging": 0.5
    }
  },
  "militaryPayData": {
    "averageBahByRank": {
      "E1-E3": 1200,
      "E4-E6": 1500,
      "E7-E9": 1800,
      "O1-O3": 1600,
      "O4-O6": 2100,
      "O7-O10": 2800
    },
    "colaAverages": {
      "conus": 0,
      "overseas": 8.5,
      "highCost": 12.3,
      "remote": 15.8
    },
    "specialPay": {
      "hazardDuty": 225,
      "flightPay": 250,
      "subPay": 425,
      "divePay": 340
    }
  },
  "taxData": {
    "federalTaxBrackets": [
      {
        "min": 0,
        "max": 11000,
        "rate": 10
      },
      {
        "min": 11000,
        "max": 44725,
        "rate": 12
      },
      {
        "min": 44725,
        "max": 95375,
        "rate": 22
      },
      {
        "min": 95375,
        "max": 182050,
        "rate": 24
      },
      {
        "min": 182050,
        "max": 231250,
        "rate": 32
      },
      {
        "min": 231250,
        "max": 578125,
        "rate": 35
      },
      {
        "min": 578125,
        "max": 999999999,
        "rate": 37
      }
    ],
    "standardDeduction": {
      "single": 13850,
      "marriedJoint": 27700,
      "marriedSeparate": 13850,
      "headOfHousehold": 20800
    },
    "capitalGainsRates": {
      "shortTerm": "ordinaryIncome",
      "longTermLow": 0,
      "longTermMid": 15,
      "longTermHigh": 20
    },
    "homeownerDeductions": {
      "mortgageInterestLimit": 750000,
      "saltDeductionLimit": 10000,
      "capitalGainsExclusion": {
        "single": 250000,
        "married": 500000
      }
    }
  },
  "costOfLivingByState": {
    "Alabama": {
      "index": 88.5,
      "housing": 79.2,
      "utilities": 95.8
    },
    "Alaska": {
      "index": 127.1,
      "housing": 134.3,
      "utilities": 169.0
    },
    "Arizona": {
      "index": 106.9,
      "housing": 110.6,
      "utilities": 102.3
    },
    "California": {
      "index": 151.7,
      "housing": 196.5,
      "utilities": 122.4
    },
    "Colorado": {
      "index": 110.5,
      "housing": 128.1,
      "utilities": 98.2
    },
    "Florida": {
      "index": 103.1,
      "housing": 108.4,
      "utilities": 107.2
    },
    "Georgia": {
      "index": 93.4,
      "housing": 89.2,
      "utilities": 103.8
    },
    "Hawaii": {
      "index": 184.5,
      "housing": 258.2,
      "utilities": 168.9
    },
    "Texas": {
      "index": 93.9,
      "housing": 90.7,
      "utilities": 107.1
    },
    "Virginia": {
      "index": 106.7,
      "housing": 111.8,
      "utilities": 102.5
    },
    "Washington": {
      "index": 115.4,
      "housing": 130.2,
      "utilities": 89.1
    }
  },
  "militaryBasesData": {
    "majorBases": {
      "fortLiberty": {
        "state": "North Carolina",
        "costIndex": 94.2,
        "averageBah": 1450,
        "localRentIndex": 92.1
      },
      "fortCavazos": {
        "state": "Texas",
        "costIndex": 89.7,
        "averageBah": 1380,
        "localRentIndex": 88.5
      },
      "pentagonArea": {
        "state": "Virginia",
        "costIndex": 125.8,
        "averageBah": 2150,
        "localRentIndex": 134.2
      },
      "sandiegoBases": {
        "state": "California",
        "costIndex": 164.2,
        "averageBah": 2850,
        "localRentIndex": 187.3
      }
    }
  },
  "calculatorDefaults": {
    "pcsDeduction": {
      "grossIncome": 75000,
      "bah": 1500,
      "pcsTimeframe": 36,
      "filingStatus": "marriedJoint",
      "hasChildren": true,
      "homePrice": 350000,
      "downPayment": 20
    },
    "buyVsRent": {
      "homePrice": 350000,
      "downPayment": 20,
      "rentPrice": 1750,
      "pcsTimeframe": 36,
      "loanType": "va",
      "includeMaintenance": true
    },
    "vaLoanCalculator": {
      "loanAmount": 280000,
      "downPayment": 0,
      "loanTerm": 30,
      "veteranType": "firstTime",
      "disabilityRating": 0,
      "fundingFeeFinanced": true
    },
    "colaPcsTool": {
      "currentBase": "fortLiberty",
      "targetBase": "sandiegoBases",
      "rank": "E5",
      "dependents": 2,
      "currentBah": 1450,
      "targetBah": 2850
    }
  },
  "phase3Data": {
    "capitalGains": {
      "primaryResidenceExclusion": {
        "single": 250000,
        "marriedFilingJointly": 500000,
        "qualificationPeriod": 24,
        "ownershipRequirement": 24,
        "useTest": 24,
        "pcsExtension": 60,
        "maxPcsExtensions": 10
      },
      "capitalGainsTaxRates": {
        "shortTerm": {
          "description": "Taxed as ordinary income",
          "rates": [
            10,
            12,
            22,
            24,
            32,
            35,
            37
          ]
        },
        "longTerm": {
          "single": [
            {
              "min": 0,
              "max": 44625,
              "rate": 0
            },
            {
              "min": 44626,
              "max": 492300,
              "rate": 15
            },
            {
              "min": 492301,
              "max": 999999999,
              "rate": 20
            }
          ],
          "marriedFilingJointly": [
            {
              "min": 0,
              "max": 89250,
              "rate": 0
            },
            {
              "min": 89251,
              "max": 553850,
              "rate": 15
            },
            {
              "min": 553851,
              "max": 999999999,
              "rate": 20
            }
          ]
        }
      }
    },
    "depreciation": {
      "residentialRental": {
        "depreciationPeriod": 27.5,
        "commercialPeriod": 39,
        "recaptureRate": 25,
        "section1250Property": true
      },
      "improvementCategories": {
        "majorRenovations": {
          "depreciationYears": 27.5,
          "recaptureRate": 25
        },
        "appliances": {
          "depreciationYears": 5,
          "recaptureRate": 25
        },
        "carpeting": {
          "depreciationYears": 5,
          "recaptureRate": 25
        },
        "hvacSystem": {
          "depreciationYears": 27.5,
          "recaptureRate": 25
        }
      }
    },
    "militaryRetirement": {
      "retirementSystems": {
        "legacy": {
          "multiplier": 0.025,
          "yearsRequired": 20,
          "vestingSchedule": "cliff",
          "colaAdjustment": true
        },
        "brs": {
          "multiplier": 0.02,
          "yearsRequired": 20,
          "vestingSchedule": "graded",
          "automaticContribution": 0.01,
          "matchingContribution": 0.04,
          "continuationPay": 2.5
        }
      },
      "averageRetirementAge": {
        "enlisted": 42,
        "officer": 45,
        "lifeExpectancy": 78
      }
    },
    "tsp": {
      "contributionLimits2025": {
        "employee": 23500,
        "catchUp": 7500,
        "totalWithCatchUp": 31000,
        "employerMatch": 5
      },
      "historicalReturns": {
        "cFund": {
          "average20Year": 10.2,
          "average10Year": 11.8,
          "average5Year": 9.4,
          "standardDeviation": 16.2
        },
        "sFund": {
          "average20Year": 8.9,
          "average10Year": 10.1,
          "average5Year": 7.8,
          "standardDeviation": 20.4
        },
        "iFund": {
          "average20Year": 7.2,
          "average10Year": 6.8,
          "average5Year": 5.9,
          "standardDeviation": 18.7
        },
        "fFund": {
          "average20Year": 5.1,
          "average10Year": 3.2,
          "average5Year": 2.8,
          "standardDeviation": 4.2
        },
        "gFund": {
          "average20Year": 2.8,
          "average10Year": 2.1,
          "average5Year": 1.9,
          "standardDeviation": 0.8
        }
      },
      "allocationTargets": {
        "aggressive": {
          "cFund": 70,
          "sFund": 20,
          "iFund": 10,
          "fFund": 0,
          "gFund": 0
        },
        "moderate": {
          "cFund": 50,
          "sFund": 15,
          "iFund": 15,
          "fFund": 15,
          "gFund": 5
        },
        "conservative": {
          "cFund": 20,
          "sFund": 10,
          "iFund": 10,
          "fFund": 40,
          "gFund": 20
        }
      }
    },
    "sbp": {
      "costByPayGrade": {
        "E1-E4": {
          "baseAmount": 1500,
          "maxCoverage": 1500,
          "premiumRate": 6.5
        },
        "E5-E6": {
          "baseAmount": 2000,
          "maxCoverage": 2500,
          "premiumRate": 6.5
        },
        "E7-E9": {
          "baseAmount": 3000,
          "maxCoverage": 4000,
          "premiumRate": 6.5
        },
        "O1-O3": {
          "baseAmount": 2500,
          "maxCoverage": 3500,
          "premiumRate": 6.5
        },
        "O4-O6": {
          "baseAmount": 4000,
          "maxCoverage": 6000,
          "premiumRate": 6.5
        },
        "O7-O10": {
          "baseAmount": 6000,
          "maxCoverage": 10000,
          "premiumRate": 6.5
        }
      },
      "benefitPercentages": {
        "spouse": 55,
        "children": 55,
        "spouseAndChildren": 55
      },
      "ageAdjustments": {
        "under62": 0,
        "62to65": -5,
        "over65": -10
      }
    },
    "lifeInsurance": {
      "termRates": {
        "age25": {
          "250k": 15,
          "500k": 25,
          "1000k": 45
        },
        "age35": {
          "250k": 18,
          "500k": 32,
          "1000k": 58
        },
        "age45": {
          "250k": 35,
          "500k": 65,
          "1000k": 125
        },
        "age55": {
          "250k": 85,
          "500k": 165,
          "1000k": 325
        }
      },
      "wholeLifeRates": {
        "age25": {
          "250k": 180,
          "500k": 350,
          "1000k": 695
        },
        "age35": {
          "250k": 250,
          "500k": 485,
          "1000k": 965
        },
        "age45": {
          "250k": 385,
          "500k": 765,
          "1000k": 1525
        },
        "age55": {
          "250k": 685,
          "500k": 1365,
          "1000k": 2725
        }
      },
      "sgli": {
        "maxCoverage": 500000,
        "monthlyPremium": 29,
        "familySgli": 100000,
        "familyPremium": 5.50
      }
    },
    "giBill": {
      "postGiHousingStipen": {
        "inPersonFullTime": 1.0,
        "inPersonThreeQuarter": 0.8,
        "inPersonHalfTime": 0.4,
        "onlineOnly": 906.50,
        "yellowRibbonProgram": true
      },
      "tuitionRates2025": {
        "publicInState": 25290,
        "publicOutOfState": 45240,
        "private": 55800,
        "maxPrivatePayment": 26381.37
      },
      "entitlementMonths": {
        "full": 36,
        "stemExtension": 9,
        "restorationEligible": true
      },
      "bookStipend": {
        "maxAnnual": 1000,
        "proRated": true
      }
    }
  }
}
;
