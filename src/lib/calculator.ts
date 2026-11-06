/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LoanCalculationResult } from '../types';

/**
 * Calculates standard amortized loan repayment values.
 * Uses the standard annuity formula: M = P * [r(1 + r)^n] / [(1 + r)^n - 1]
 */
export function calculateLoanRepayment(
  principal: number,
  annualRatePct: number,
  termMonths: number
): LoanCalculationResult {
  const P = Math.max(0, principal);
  const n = Math.max(1, termMonths);
  const annualRate = Math.max(0, annualRatePct);
  const r = annualRate / 100 / 12;

  let monthlyPayment = 0;
  if (r === 0) {
    monthlyPayment = P / n;
  } else {
    const factor = Math.pow(1 + r, n);
    monthlyPayment = (P * r * factor) / (factor - 1);
  }

  const totalRepayment = monthlyPayment * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  // Generate 6 sample timeline amortization milestones
  const amortizationPreview = [];
  let remaining = P;
  for (let month = 1; month <= n; month++) {
    const interestForMonth = remaining * r;
    const principalForMonth = monthlyPayment - interestForMonth;
    remaining = Math.max(0, remaining - principalForMonth);

    // Keep milestones or first 12 months
    if (month <= 12 || month % 6 === 0 || month === n) {
      amortizationPreview.push({
        month,
        principalPaid: Math.round(principalForMonth),
        interestPaid: Math.round(interestForMonth),
        remainingBalance: Math.round(remaining),
      });
    }
  }

  return {
    loanAmount: P,
    annualInterestRate: annualRate,
    repaymentPeriodMonths: n,
    monthlyRepayment: Math.round(monthlyPayment * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    amortizationPreview,
  };
}

/**
 * Calculates Debt-to-Income (DTI) ratio
 * DTI = (Total Monthly Debt Payments / Gross Monthly Income) * 100
 */
export function calculateDTI(
  monthlyIncome: number,
  additionalIncome: number,
  monthlyObligations: number,
  monthlyRent: number,
  otherCommitments: number,
  newLoanMonthlyEstimate = 0
): { dtiPct: number; riskRating: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' } {
  const totalIncome = Math.max(1, (monthlyIncome || 0) + (additionalIncome || 0));
  const totalDebt = (monthlyObligations || 0) + (monthlyRent || 0) + (otherCommitments || 0) + (newLoanMonthlyEstimate || 0);

  const dtiPct = Math.round((totalDebt / totalIncome) * 100);

  let riskRating: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' = 'Low Risk';
  if (dtiPct > 45) {
    riskRating = 'Elevated Risk';
  } else if (dtiPct > 35) {
    riskRating = 'Moderate Risk';
  }

  return { dtiPct, riskRating };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
