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
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
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
  donations50: 0,
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
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
  donations50: 0,
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
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
  sec80ggRent: 120000,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0,
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
});
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
  isDiffAbled: true,
  disabilityLevel: 'severe',
  hasDisabledDependent: false,
  dependentDisabilityLevel: 'none',
  isDefenseExempt: false,
  familyPension: 0,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0,
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
});
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
  familyPension: 150000,
  sec80ggRent: 0,
  sec80eInterest: 0,
  sec80eeaInterest: 0,
  donations100: 0,
  donations50: 0,
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
});
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
  sec80eeb: 100000,
  vehiclePrice: 3000000,
  stcgEquities: 0,
  ltcgEquities: 0,
  unrealizedLosses: 0
});
console.log(`Vehicle Taxable Old: ${vehicleResult.oldRegime.taxableIncome} (Old Tax: ${vehicleResult.oldRegime.finalTax}, New Tax: ${vehicleResult.newRegime.finalTax})`);

// 8. Capital Gains (Sec 111A & Sec 112A) Test
const gainsResult = calculateTaxAll({
  grossSalary: 1000000,
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
  sec80eeb: 0,
  vehiclePrice: 0,
  stcgEquities: 100000, // 1L @ 20% = 20,000 tax
  ltcgEquities: 225000, // 2.25L - 1.25L exemption = 1L taxable @ 12.5% = 12,500 tax
  unrealizedLosses: 0
});
console.log(`Gains Old Tax: ${gainsResult.oldRegime.finalTax} (Expected: 109200)`);

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
  vehicleResult.newRegime.finalTax === 67500 &&
  gainsResult.oldRegime.finalTax === 109200
) {
  console.log("=== ALL ASSERTIONS PASSED SUCCESSFULLY ===");
} else {
  console.error("!!! ASSERTION FAILURE IN PORTED ENGINE !!!");
  process.exit(1);
}
