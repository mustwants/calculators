import Foundation

struct MortgageInputs {
    var homePrice: Double
    var downPayment: Double
    var interestRate: Double
    var loanTermYears: Int
    var annualTaxes: Double
    var annualInsurance: Double
}

struct MortgageResults {
    var monthlyPayment: Double
    var totalLoanAmount: Double
}

func calculateMortgage(inputs: MortgageInputs) -> MortgageResults {
    let loanAmount = inputs.homePrice - inputs.downPayment
    let monthlyRate = inputs.interestRate / 100 / 12
    let months = inputs.loanTermYears * 12

    let basePayment = loanAmount * monthlyRate / (1 - pow(1 + monthlyRate, Double(-months)))
    let taxMonthly = inputs.annualTaxes / 12
    let insuranceMonthly = inputs.annualInsurance / 12

    let totalMonthly = basePayment + taxMonthly + insuranceMonthly

    return MortgageResults(
        monthlyPayment: totalMonthly,
        totalLoanAmount: loanAmount
    )
}
