import { FinancialScenario, HypotheticalAssumptions } from '@/types/market';

export const HYPOTHETICAL_DISCLAIMER =
  'CENÁRIO HIPOTÉTICO — Simulação matemática baseada em premissas editáveis pelo usuário. NÃO constitui previsão real de vendas ou faturamento.';

export function calculateHypotheticalScenario(
  name: FinancialScenario['name'],
  assumptions: HypotheticalAssumptions
): FinancialScenario {
  const deals = Math.max(
    0,
    Math.round(
      assumptions.prospectableCompanies *
        (assumptions.effectiveContactRate / 100) *
        (assumptions.responseRate / 100) *
        (assumptions.meetingConversionRate / 100) *
        (assumptions.closingRate / 100)
    )
  );

  const upfrontRevenue = Math.round(deals * assumptions.avgSetupFee);
  const firstYearArr = Math.round(deals * assumptions.avgMonthlyFee * 12);
  const paybackMonths =
    assumptions.avgMonthlyFee > 0
      ? Number((assumptions.estimatedCac / assumptions.avgMonthlyFee).toFixed(1))
      : null;

  return {
    name,
    isHypotheticalScenario: true,
    disclaimer: HYPOTHETICAL_DISCLAIMER,
    assumptions,
    dealsClosed: deals,
    upfrontRevenue,
    firstYearArr,
    paybackMonths,
  };
}

export function generateFinancialScenarios(
  customAssumptions?: Partial<HypotheticalAssumptions>
): FinancialScenario[] {
  const base: HypotheticalAssumptions = {
    prospectableCompanies: customAssumptions?.prospectableCompanies ?? 0,
    effectiveContactRate: customAssumptions?.effectiveContactRate ?? 0,
    responseRate: customAssumptions?.responseRate ?? 0,
    meetingConversionRate: customAssumptions?.meetingConversionRate ?? 0,
    closingRate: customAssumptions?.closingRate ?? 0,
    avgSetupFee: customAssumptions?.avgSetupFee ?? 0,
    avgMonthlyFee: customAssumptions?.avgMonthlyFee ?? 0,
    estimatedCac: customAssumptions?.estimatedCac ?? 0,
  };

  return [calculateHypotheticalScenario('Personalizado', base)];
}
