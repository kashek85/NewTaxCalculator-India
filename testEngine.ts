import { calculateTaxAll } from './src/utils/taxEngine';

console.log("=== RUNNING TAX ENGINE ASSERIONS (REACT PORT) ===");

// 1. General Profile Test (10L with 30k TTA, caps at 10k)
const generalResult = calculateTaxAll({
  grossSalary: 1000000,
  employerNps: 0,
  ded80c: 150000,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0,
  dedNps: 0,
  ded80tta: 30000,
  dedOther: 0,
  age: 'general',
  // Advanced specialized inputs (default off)
  isDiffAbled: false,
  disabilityLevel: 'none',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0
});
console.log(`General Taxable Old: ${generalResult.oldRegime.taxableIncome} (Calculated Old Tax: ${generalResult.oldRegime.finalTax})`);

// 2. Senior Profile Test (10L with 30k TTB, uncapped at 30k)
const seniorResult = calculateTaxAll({
  grossSalary: 1000000,
  employerNps: 0,
  ded80c: 150000,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0,
  dedNps: 0,
  ded80tta: 30000,
  dedOther: 0,
  age: 'senior',
  isDiffAbled: false,
  disabilityLevel: 'none',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0
});
console.log(`Senior Taxable Old: ${seniorResult.oldRegime.taxableIncome} (Calculated Old Tax: ${seniorResult.oldRegime.finalTax})`);

// 3. 15L Profile Test (for crossover and monthly in-hand assertions)
const generalResult15L = calculateTaxAll({
  grossSalary: 1500000,
  employerNps: 0,
  ded80c: 0,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0,
  dedNps: 0,
  ded80tta: 0,
  dedOther: 0,
  age: 'general',
  isDiffAbled: false,
  disabilityLevel: 'none',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0
});
console.log(`Crossover Deductions needed for 15L Gross: ${generalResult15L.crossoverDeductions}`);
console.log(`Calculated Monthly In-Hand for 15L (New Regime): ${generalResult15L.newRegime.monthlyTakeHome}`);

// 4. Freelancer Rent Exemption (Sec 80GG) Test
const freelancerResult = calculateTaxAll({
  grossSalary: 600000,
  employerNps: 0,
  ded80c: 100000,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0, // Sec 80GG requires HRA to be 0
  dedNps: 0,
  ded80tta: 0,
  dedOther: 0,
  age: 'general',
  isDiffAbled: false,
  disabilityLevel: 'none',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 120000, // Rent paid: 1.2L
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0
});
// ATI = 600k (gross) - 50k (std) - 100k (80c) = 450k.
// 80GG is min of: 60k, 25% of ATI (112.5k), Rent (120k) - 10% of ATI (45k) = 75k.
// min is 60,000. So otherDeductions = 100k (80c) + 60k (80gg) = 160k.
console.log(`Freelancer Old Deductions: ${freelancerResult.oldRegime.otherDeductions}`);

// 5. Differently-abled (Sec 80U & Transport Exemption) Test
const diffAbledResult = calculateTaxAll({
  grossSalary: 800000,
  employerNps: 0,
  ded80c: 0,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0,
  dedNps: 0,
  ded80tta: 0,
  dedOther: 0,
  age: 'general',
  isDiffAbled: true, // Transport exemption ₹38,400 & Sec 80U severe disability ₹125,000
  disabilityLevel: 'severe',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0
});
// Adjusted Gross = 800,000 - 38,400 = 761,600.
// Taxable Old = 761.6k - 50k (std) - 125k (80U) = 586,600.
console.log(`Differently-Abled Taxable Old: ${diffAbledResult.oldRegime.taxableIncome}`);

// 6. Family Pension standard deductions (Sec 57(iia)) Test
const pensionerResult = calculateTaxAll({
  grossSalary: 0,
  employerNps: 0,
  ded80c: 0,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0,
  dedNps: 0,
  ded80tta: 0,
  dedOther: 0,
  age: 'general',
  isDiffAbled: false,
  disabilityLevel: 'none',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 150000, // Pension: 1.5L
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0
});
// Pension Standard deduction: Old = min(150k/3, 15k) = 15k. Taxable old = 150k - 15k = 135k.
// Pension Standard deduction: New = min(150k/3, 25k) = 25k. Taxable new = 150k - 25k = 125k.
console.log(`Pensioner Taxable Old: ${pensionerResult.oldRegime.taxableIncome}`);
console.log(`Pensioner Taxable New: ${pensionerResult.newRegime.taxableIncome}`);

// 7. Vehicle Tax Deductions & Credits (Sec 80EEB & Sec 206C(1F)) Test
const vehicleResult = calculateTaxAll({
  grossSalary: 1500000,
  employerNps: 0,
  ded80c: 150000,
  ded80d: 0,
  ded24b: 0,
  dedHra: 0,
  dedNps: 0,
  ded80tta: 0,
  dedOther: 0,
  age: 'general',
  isDiffAbled: false,
  disabilityLevel: 'none',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0,
  sec80eeb: 100000,   // EV loan interest: 1L
  vehiclePrice: 3000000 // Vehicle price: 30L (1% TCS = 30k credit)
});
console.log(`Vehicle Taxable Old: ${vehicleResult.oldRegime.taxableIncome} (Old Tax: ${vehicleResult.oldRegime.finalTax}, New Tax: ${vehicleResult.newRegime.finalTax})`);

console.log("=== ALL REACT PORT TESTS COMPLETED ===");
if (
  generalResult.oldRegime.finalTax === 73320 &&
  seniorResult.oldRegime.finalTax === 66560 &&
  generalResult15L.crossoverDeductions === 543750 &&
  Math.round(generalResult15L.newRegime.monthlyTakeHome) === 116675 &&
  freelancerResult.oldRegime.otherDeductions === 160000 &&
  diffAbledResult.oldRegime.taxableIncome === 586600 &&
  pensionerResult.oldRegime.taxableIncome === 135000 &&
  pensionerResult.newRegime.taxableIncome === 125000 &&
  vehicleResult.oldRegime.taxableIncome === 1200000 &&
  vehicleResult.oldRegime.finalTax === 149400 &&
  vehicleResult.newRegime.finalTax === 67500
) {
  console.log("=== ALL ASSERTIONS PASSED SUCCESSFULLY ===");
} else {
  console.error("!!! ASSERTION FAILURE IN PORTED ENGINE !!!");
  process.exit(1);
}
