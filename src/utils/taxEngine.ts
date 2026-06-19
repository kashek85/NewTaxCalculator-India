import type { AgeProfile, TaxInputs, TaxBreakdown, TaxComparisonResult } from '../types/tax';

export function formatINR(amount: number): string {
  amount = Math.round(amount);
  if (amount === 0) return '₹0';

  const x = amount.toString();
  let lastThree = x.substring(x.length - 3);
  const otherNumbers = x.substring(0, x.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return '₹' + res;
}

export function getBaseTaxOld(taxable: number, age: AgeProfile): number {
  let exemptionLimit = 250000;
  if (age === 'senior') exemptionLimit = 300000;
  else if (age === 'super-senior') exemptionLimit = 500000;

  if (taxable <= exemptionLimit) return 0;

  let tax = 0;

  if (age === 'super-senior') {
    if (taxable <= 1000000) {
      tax += (taxable - 500000) * 0.20;
    } else {
      tax += 500000 * 0.20;
      tax += (taxable - 1000000) * 0.30;
    }
  } else if (age === 'senior') {
    if (taxable <= 500000) {
      tax += (taxable - 300000) * 0.05;
    } else if (taxable <= 1000000) {
      tax += 200000 * 0.05;
      tax += (taxable - 500000) * 0.20;
    } else {
      tax += 10000 + 100000;
      tax += (taxable - 1000000) * 0.30;
    }
  } else {
    if (taxable <= 500000) {
      tax += (taxable - 250000) * 0.05;
    } else if (taxable <= 1000000) {
      tax += 250000 * 0.05;
      tax += (taxable - 500000) * 0.20;
    } else {
      tax += 12500 + 100000;
      tax += (taxable - 1000000) * 0.30;
    }
  }

  return tax;
}

export function getBaseTaxNew(taxable: number): number {
  if (taxable <= 400000) return 0;

  let tax = 0;
  const slabs = [
    { limit: 400000, rate: 0.00 },
    { limit: 800000, rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 }
  ];

  let prevLimit = 0;
  for (let i = 0; i < slabs.length; i++) {
    const slab = slabs[i];
    if (taxable > slab.limit) {
      tax += (slab.limit - prevLimit) * slab.rate;
      prevLimit = slab.limit;
    } else {
      tax += (taxable - prevLimit) * slab.rate;
      break;
    }
  }
  return tax;
}

export function calculateSurchargeAndRelief(
  taxableIncome: number,
  baseTax: number,
  regime: 'old' | 'new',
  age: AgeProfile
): { surcharge: number; marginalRelief: number; finalTaxBeforeCess: number } {
  let surchargeRate = 0;
  if (taxableIncome > 50000000) {
    surchargeRate = regime === 'new' ? 0.25 : 0.37;
  } else if (taxableIncome > 20000000) {
    surchargeRate = 0.25;
  } else if (taxableIncome > 10000000) {
    surchargeRate = 0.15;
  } else if (taxableIncome > 5000000) {
    surchargeRate = 0.10;
  }

  const surcharge = baseTax * surchargeRate;
  const totalWithSurcharge = baseTax + surcharge;

  const thresholds = [5000000, 10000000, 20000000, 50000000];
  let marginalRelief = 0;

  for (let i = 0; i < thresholds.length; i++) {
    const T = thresholds[i];
    if (taxableIncome > T) {
      const taxAtT = regime === 'new' ? getBaseTaxNew(T) : getBaseTaxOld(T, age);

      let surchargeRateAtT = 0;
      if (T === 5000000) surchargeRateAtT = 0.0;
      else if (T === 10000000) surchargeRateAtT = 0.10;
      else if (T === 20000000) surchargeRateAtT = 0.15;
      else if (T === 50000000) surchargeRateAtT = 0.25;

      const surchargeAtT = taxAtT * surchargeRateAtT;
      const totalAtT = taxAtT + surchargeAtT;

      const maxAllowedTax = totalAtT + (taxableIncome - T);

      if (totalWithSurcharge > maxAllowedTax) {
        marginalRelief = Math.max(0, totalWithSurcharge - maxAllowedTax);
      }
    }
  }

  return {
    surcharge: surcharge,
    marginalRelief: marginalRelief,
    finalTaxBeforeCess: totalWithSurcharge - marginalRelief
  };
}

export function simulateOldTax(
  grossSalary: number,
  allowedEmployerNps: number,
  restDeductions: number,
  age: AgeProfile
): number {
  const stdDedOld = grossSalary > 0 ? 50000 : 0;
  const totalGross = grossSalary + allowedEmployerNps;
  const totalDeductionsOld = allowedEmployerNps + restDeductions;
  const taxableOld = Math.max(0, totalGross - stdDedOld - totalDeductionsOld);
  const baseTaxOld = getBaseTaxOld(taxableOld, age);

  let rebateOld = 0;
  if (taxableOld <= 500000) rebateOld = baseTaxOld;
  const taxAfterRebateOld = Math.max(0, baseTaxOld - rebateOld);

  const surOldResult = calculateSurchargeAndRelief(taxableOld, taxAfterRebateOld, 'old', age);
  const cessOld = surOldResult.finalTaxBeforeCess * 0.04;
  return surOldResult.finalTaxBeforeCess + cessOld;
}

export function calculateCrossoverDeductions(
  grossSalary: number,
  allowedEmployerNps: number,
  targetTax: number,
  age: AgeProfile
): number {
  let low = 0;
  let high = grossSalary;
  let mid = 0;

  // If even with 0 deductions, Old regime tax is lower than or equal to New regime tax:
  if (simulateOldTax(grossSalary, allowedEmployerNps, 0, age) <= targetTax) {
    return 0;
  }

  // Binary search crossover point
  for (let iter = 0; iter < 24; iter++) {
    mid = (low + high) / 2;
    const testTax = simulateOldTax(grossSalary, allowedEmployerNps, mid, age);
    if (testTax > targetTax) {
      low = mid; // Needs more deductions
    } else {
      high = mid; // Needs less deductions
    }
  }
  return Math.round(mid);
}

export function calculateTaxAll(inputs: TaxInputs): TaxComparisonResult {
  const {
    grossSalary,
    employerNps,
    ded80c,
    ded80d,
    ded24b,
    dedHra,
    dedNps,
    ded80tta,
    dedOther,
    age,

    isDiffAbled,
    disabilityLevel,
    hasDisabledDependent,
    dependentDisabilityLevel,
    isDefenseExempt,
    familyPension,
    sec80ggRent,
    sec80eInterest,
    sec80eeaInterest,
    donations100,
    donations50,
    sec80eeb,
    vehiclePrice,
    stcgEquities,
    ltcgEquities
  } = inputs;

  // 1. Gross Salary Exemptions (Affects both regimes)
  // Differently-abled employees get up to ₹38,400 per year Transport Exemption under Sec 10(14)
  const transportExemption = isDiffAbled ? Math.min(grossSalary, 38400) : 0;
  const adjustedGrossSalary = Math.max(0, grossSalary - transportExemption);

  const allowedEmployerNps = Math.min(employerNps, Math.round(adjustedGrossSalary * 0.10));
  
  // Family Pension Standard Deduction (Sec 57(iia)) (Affects both regimes, unless 100% defense exempt)
  const familyPensionDedOld = isDefenseExempt ? 0 : Math.min(familyPension / 3, 15000);
  const familyPensionDedNew = isDefenseExempt ? 0 : Math.min(familyPension / 3, 25000);

  const netFamilyPensionOld = isDefenseExempt ? 0 : Math.max(0, familyPension - familyPensionDedOld);
  const netFamilyPensionNew = isDefenseExempt ? 0 : Math.max(0, familyPension - familyPensionDedNew);

  const totalGrossOld = adjustedGrossSalary + allowedEmployerNps + netFamilyPensionOld;
  const totalGrossNew = adjustedGrossSalary + allowedEmployerNps + netFamilyPensionNew;

  // --- OLD REGIME ---
  const stdDedOld = adjustedGrossSalary > 0 ? 50000 : 0;
  
  // Dynamic Caps Check
  const max80d = age === 'general' ? 75000 : 100000;
  const capped80d = Math.min(ded80d, max80d);

  const maxTta = age === 'general' ? 10000 : 50000;
  const capped80tta = Math.min(ded80tta, maxTta);

  // Specialized Audience Deductions (Old Regime Only)
  // Section 80U (Self Disability)
  let ded80u = 0;
  if (isDiffAbled) {
    if (disabilityLevel === 'normal') ded80u = 75000;
    else if (disabilityLevel === 'severe') ded80u = 125000;
  }

  // Section 80DD (Disabled Dependent Care)
  let ded80dd = 0;
  if (hasDisabledDependent) {
    if (dependentDisabilityLevel === 'normal') ded80dd = 75000;
    else if (dependentDisabilityLevel === 'severe') ded80dd = 125000;
  }

  // Section 80E (Education Loan Interest)
  const ded80e = sec80eInterest;

  // Section 80EEA (First-Time Buyer Interest)
  const ded80eea = Math.min(sec80eeaInterest, 150000);

  // Section 80G / 80GGC (Donations)
  const ded80g = donations100 + (donations50 * 0.50);

  // Section 80EEB (Electric Vehicle Loan Interest)
  const ded80eeb = Math.min(sec80eeb || 0, 150000);

  // Section 80GG (Rent Paid without HRA)
  // Calculated on Adjusted Total Income (ATI) excluding 80GG itself
  const otherDedsExcluding80GG = 
    allowedEmployerNps + ded80c + capped80d + ded24b + dedNps + capped80tta + dedOther +
    ded80u + ded80dd + ded80e + ded80eea + ded80g + ded80eeb;
  
  const ati = Math.max(0, adjustedGrossSalary + allowedEmployerNps + netFamilyPensionOld - stdDedOld - otherDedsExcluding80GG);
  
  let ded80gg = 0;
  if (sec80ggRent > 0 && dedHra === 0 && ati > 0) {
    const cond1 = 60000; // ₹5,000/month
    const cond2 = 0.25 * ati;
    const cond3 = Math.max(0, sec80ggRent - 0.10 * ati);
    ded80gg = Math.round(Math.min(cond1, cond2, cond3));
  }

  const restDeductionsOld = 
    ded80c + capped80d + ded24b + dedHra + dedNps + capped80tta + dedOther +
    ded80u + ded80dd + ded80e + ded80eea + ded80g + ded80gg + ded80eeb;

  const totalDeductionsOld = allowedEmployerNps + restDeductionsOld;
  const taxableOld = Math.max(0, totalGrossOld - stdDedOld - totalDeductionsOld);

  const baseTaxOld = getBaseTaxOld(taxableOld, age);

  let rebateOld = 0;
  if (taxableOld <= 500000) {
    rebateOld = baseTaxOld;
  }
  const taxAfterRebateOld = Math.max(0, baseTaxOld - rebateOld);

  // Calculate Capital Gains tax
  const stcgTax = (stcgEquities || 0) * 0.20;
  const ltcgTax = Math.max(0, (ltcgEquities || 0) - 125000) * 0.125;
  const baseWithCapGainsOld = taxAfterRebateOld + stcgTax + ltcgTax;

  const surOldResult = calculateSurchargeAndRelief(taxableOld, baseWithCapGainsOld, 'old', age);
  const cessOld = surOldResult.finalTaxBeforeCess * 0.04;
  const rawTaxOld = surOldResult.finalTaxBeforeCess + cessOld;

  // Section 206C(1F) Vehicle TCS Credit
  const tcsCredit = vehiclePrice > 1000000 ? Math.round(vehiclePrice * 0.01) : 0;

  const finalTaxOld = Math.max(0, rawTaxOld - tcsCredit);

  // --- NEW REGIME ---
  const stdDedNew = adjustedGrossSalary > 0 ? 75000 : 0;
  const totalDeductionsNew = allowedEmployerNps;
  const taxableNew = Math.max(0, totalGrossNew - stdDedNew - totalDeductionsNew);

  const baseTaxNew = getBaseTaxNew(taxableNew);

  let rebateNew = 0;
  let rebateMarginalReliefNew = 0;

  if (taxableNew <= 1200000) {
    rebateNew = baseTaxNew;
  } else if (taxableNew <= 1270588) {
    const taxWithoutRebate = baseTaxNew;
    const extraIncome = taxableNew - 1200000;
    rebateMarginalReliefNew = Math.max(0, taxWithoutRebate - extraIncome);
  }

  const taxAfterRebateNew = Math.max(0, baseTaxNew - rebateNew - rebateMarginalReliefNew);
  const baseWithCapGainsNew = taxAfterRebateNew + stcgTax + ltcgTax;

  const surNewResult = calculateSurchargeAndRelief(taxableNew, baseWithCapGainsNew, 'new', age);
  const cessNew = surNewResult.finalTaxBeforeCess * 0.04;
  const rawTaxNew = surNewResult.finalTaxBeforeCess + cessNew;
  const finalTaxNew = Math.max(0, rawTaxNew - tcsCredit);

  const totalMROld = surOldResult.marginalRelief;
  const totalMRNew = surNewResult.marginalRelief + rebateMarginalReliefNew;

  // Net cash take home excludes taxes, professional tax, and also adjusts for actual out-of-pocket rent/donations
  const monthlyOldTakeHome = Math.max(0, (grossSalary + familyPension - finalTaxOld - 2400) / 12);
  const monthlyNewTakeHome = Math.max(0, (grossSalary + familyPension - finalTaxNew - 2400) / 12);

  const oldBreakdown: TaxBreakdown = {
    totalGross: totalGrossOld,
    stdDeduction: stdDedOld,
    allowedEmployerNps,
    otherDeductions: restDeductionsOld,
    taxableIncome: taxableOld,
    baseTax: baseTaxOld,
    stcgTax,
    ltcgTax,
    rebate: rebateOld,
    surcharge: surOldResult.surcharge,
    marginalRelief: totalMROld,
    cess: cessOld,
    tcsCredit,
    finalTax: finalTaxOld,
    monthlyTakeHome: monthlyOldTakeHome
  };

  const newBreakdown: TaxBreakdown = {
    totalGross: totalGrossNew,
    stdDeduction: stdDedNew,
    allowedEmployerNps,
    otherDeductions: 0,
    taxableIncome: taxableNew,
    baseTax: baseTaxNew,
    stcgTax,
    ltcgTax,
    rebate: rebateNew,
    surcharge: surNewResult.surcharge,
    marginalRelief: totalMRNew,
    cess: cessNew,
    tcsCredit,
    finalTax: finalTaxNew,
    monthlyTakeHome: monthlyNewTakeHome
  };

  // Profile-aware Crossover solver closure
  const localSimulateOldTax = (deductionsAmount: number): number => {
    const tempTaxable = Math.max(0, totalGrossOld - stdDedOld - allowedEmployerNps - deductionsAmount);
    const tempBase = getBaseTaxOld(tempTaxable, age);
    let tempRebate = 0;
    if (tempTaxable <= 500000) tempRebate = tempBase;
    const tempTaxAfterRebate = Math.max(0, tempBase - tempRebate);
    const tempBaseWithCG = tempTaxAfterRebate + stcgTax + ltcgTax;
    const tempSur = calculateSurchargeAndRelief(tempTaxable, tempBaseWithCG, 'old', age);
    const tempCess = tempSur.finalTaxBeforeCess * 0.04;
    const tempFinalTax = tempSur.finalTaxBeforeCess + tempCess;
    return Math.max(0, tempFinalTax - tcsCredit);
  };

  const solveCrossover = (): number => {
    let low = 0;
    let high = adjustedGrossSalary + netFamilyPensionOld;
    let mid = 0;
    
    if (localSimulateOldTax(0) <= finalTaxNew) {
      return 0;
    }
    
    for (let iter = 0; iter < 24; iter++) {
      mid = (low + high) / 2;
      const testTax = localSimulateOldTax(mid);
      if (testTax > finalTaxNew) {
        low = mid;
      } else {
        high = mid;
      }
    }
    return Math.round(mid);
  };

  const crossover = solveCrossover();

  let verdict: 'old' | 'new' | 'identical' = 'identical';
  if (finalTaxNew < finalTaxOld) verdict = 'new';
  else if (finalTaxOld < finalTaxNew) verdict = 'old';

  return {
    oldRegime: oldBreakdown,
    newRegime: newBreakdown,
    verdict,
    savings: Math.abs(finalTaxOld - finalTaxNew),
    crossoverDeductions: crossover
  };
}
