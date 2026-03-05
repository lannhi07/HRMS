import { getConfigValue } from '../controllers/configController.js';
const getInsuranceRates = () => ({
  si: getConfigValue('siRate', 8),
  hi: getConfigValue('hiRate', 1.5),
  ui: getConfigValue('uiRate', 1),
});
const getPitBrackets = () => [
  { limit: getConfigValue('pitBracket1Limit', 5000000), rate: getConfigValue('pitBracket1Rate', 5) / 100 },
  { limit: getConfigValue('pitBracket2Limit', 10000000), rate: getConfigValue('pitBracket2Rate', 10) / 100 },
  { limit: getConfigValue('pitBracket3Limit', 18000000), rate: getConfigValue('pitBracket3Rate', 15) / 100 },
  { limit: getConfigValue('pitBracket4Limit', 32000000), rate: getConfigValue('pitBracket4Rate', 20) / 100 },
  { limit: getConfigValue('pitBracket5Limit', 52000000), rate: getConfigValue('pitBracket5Rate', 25) / 100 },
  { limit: getConfigValue('pitBracket6Limit', 80000000), rate: getConfigValue('pitBracket6Rate', 30) / 100 },
  { limit: Infinity, rate: getConfigValue('pitBracket7Rate', 35) / 100 },
];
const calculatePit = (taxableIncome: number): number => {
  const brackets = getPitBrackets();
  let tax = 0;
  let remaining = taxableIncome;
  let previousLimit = 0;
  for (const bracket of brackets) {
    const bracketAmount = Math.min(remaining, bracket.limit - previousLimit);
    if (bracketAmount <= 0) break;
    tax += bracketAmount * bracket.rate;
    remaining -= bracketAmount;
    previousLimit = bracket.limit;
  }
  return Math.round(tax);
};
const calculateInsurance = (baseSalary: number, rates: { si: number; hi: number; ui: number }) => {
  const maxSalaryForInsurance = getConfigValue('maxSalaryForInsurance', 36000000);
  const base = Math.min(baseSalary, maxSalaryForInsurance);
  return {
    socialInsurance: Math.round(base * (rates.si / 100)),
    healthInsurance: Math.round(base * (rates.hi / 100)),
    unemploymentInsurance: Math.round(base * (rates.ui / 100)),
    total: Math.round(base * ((rates.si + rates.hi + rates.ui) / 100))
  };
};
export const calculateNetFromGross = (grossSalary: number, dependents: number = 0) => {
  const rates = getInsuranceRates();
  const insurance = calculateInsurance(grossSalary, rates);
  const personalDeduction = getConfigValue('personalDeduction', 11000000);
  const dependentDeduction = dependents * getConfigValue('dependentDeduction', 4400000);
  const taxableIncome = Math.max(0, grossSalary - insurance.total - personalDeduction - dependentDeduction);
  const pit = calculatePit(taxableIncome);
  return {
    grossSalary,
    socialInsurance: insurance.socialInsurance,
    healthInsurance: insurance.healthInsurance,
    unemploymentInsurance: insurance.unemploymentInsurance,
    totalInsurance: insurance.total,
    personalDeduction,
    dependentDeduction,
    taxableIncome,
    personalIncomeTax: pit,
    netSalary: grossSalary - insurance.total - pit
  };
};