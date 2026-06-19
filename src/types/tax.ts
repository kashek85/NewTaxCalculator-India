export type AgeProfile = 'general' | 'senior' | 'super-senior';
export type DisabilityLevel = 'none' | 'normal' | 'severe';

export interface TaxInputs {
  grossSalary: number;
  employerNps: number;
  ded80c: number;
  ded80d: number;
  ded24b: number;
  dedHra: number;
  dedNps: number;
  ded80tta: number;
  dedOther: number;
  age: AgeProfile;

  // Advanced specialized inputs
  isDiffAbled: boolean;
  disabilityLevel: DisabilityLevel;
  hasDisabledDependent: boolean;
  dependentDisabilityLevel: DisabilityLevel;
  isDefenseExempt: boolean;
  familyPension: number;
  sec80ggRent: number;
  sec80eInterest: number;
  sec80eeaInterest: number;
  donations100: number;
  donations50: number;
  sec80eeb: number;
  vehiclePrice: number;
  stcgEquities: number;
  ltcgEquities: number;
  unrealizedLosses: number;
}

export interface TaxBreakdown {
  totalGross: number;
  stdDeduction: number;
  allowedEmployerNps: number;
  otherDeductions: number;
  taxableIncome: number;
  baseTax: number;
  stcgTax: number;
  ltcgTax: number;
  rebate: number;
  surcharge: number;
  marginalRelief: number;
  cess: number;
  tcsCredit?: number;
  finalTax: number;
  monthlyTakeHome: number;
}

export interface TaxComparisonResult {
  oldRegime: TaxBreakdown;
  newRegime: TaxBreakdown;
  verdict: 'old' | 'new' | 'identical';
  savings: number;
  crossoverDeductions: number;
}

export interface RecommendationTip {
  icon: string;
  title: string;
  text: string;
}
