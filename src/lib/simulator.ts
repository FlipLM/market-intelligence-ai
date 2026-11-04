import { FinancialScenario, CommercialViability } from '@/types/market';

export interface SimulatorParams {
  totalCompanies: number;
  setupFee: number;
  monthlyFee: number;
  cacEstimate: number;
}

export function generateFinancialScenarios(
  viability: CommercialViability,
  customParams?: Partial<SimulatorParams>
): FinancialScenario[] {
  const total = customParams?.totalCompanies ?? viability.totalEligibleCompanies;
  const avgSetup = customParams?.setupFee ?? (viability.recommendedPricing.implementationSetupMin + viability.recommendedPricing.implementationSetupMax) / 2;
  const avgMonthly = customParams?.monthlyFee ?? (viability.recommendedPricing.monthlyFeeMin + viability.recommendedPricing.monthlyFeeMax) / 2;
  const baseCac = customParams?.cacEstimate ?? 450;

  // Cenário Conservador
  // 15% contato efetivo, 6% resposta, 20% reunião, 12% fechamento
  const consContactRate = 0.15;
  const consResponseRate = 0.06;
  const consMeetingRate = 0.20;
  const consClosingRate = 0.12;
  
  const consDeals = Math.max(1, Math.round(
    total * consContactRate * consResponseRate * consMeetingRate * consClosingRate
  ));
  const consUpfront = consDeals * (avgSetup * 0.8);
  const consArr = consDeals * (avgMonthly * 0.85) * 12;
  const consPayback = Number((baseCac / Math.max(1, (avgMonthly * 0.85))).toFixed(1));

  // Cenário Base (Realista com ICP qualificado do Prospector)
  // 25% contato efetivo, 10% resposta, 28% reunião, 18% fechamento
  const baseContactRate = 0.25;
  const baseResponseRate = 0.10;
  const baseMeetingRate = 0.28;
  const baseClosingRate = 0.18;

  const baseDeals = Math.max(2, Math.round(
    total * baseContactRate * baseResponseRate * baseMeetingRate * baseClosingRate
  ));
  const baseUpfront = baseDeals * avgSetup;
  const baseArr = baseDeals * avgMonthly * 12;
  const basePayback = Number((baseCac / Math.max(1, avgMonthly)).toFixed(1));

  // Cenário Otimista (Abordagem de alta diferenciação & problemas críticos)
  // 35% contato efetivo, 16% resposta, 35% reunião, 25% fechamento
  const optContactRate = 0.35;
  const optResponseRate = 0.16;
  const optMeetingRate = 0.35;
  const optClosingRate = 0.25;

  const optDeals = Math.max(4, Math.round(
    total * optContactRate * optResponseRate * optMeetingRate * optClosingRate
  ));
  const optUpfront = optDeals * (avgSetup * 1.25);
  const optArr = optDeals * (avgMonthly * 1.2) * 12;
  const optPayback = Number((baseCac / Math.max(1, (avgMonthly * 1.2))).toFixed(1));

  return [
    {
      name: 'Conservador',
      prospectableCompanies: total,
      effectiveContactRate: consContactRate * 100,
      responseRate: consResponseRate * 100,
      meetingConversionRate: consMeetingRate * 100,
      closingRate: consClosingRate * 100,
      dealsClosed: consDeals,
      avgSetupFee: Math.round(avgSetup * 0.8),
      avgMonthlyFee: Math.round(avgMonthly * 0.85),
      upfrontRevenue: Math.round(consUpfront),
      firstYearArr: Math.round(consArr),
      estimatedCac: Math.round(baseCac * 1.25),
      paybackMonths: consPayback
    },
    {
      name: 'Base',
      prospectableCompanies: total,
      effectiveContactRate: baseContactRate * 100,
      responseRate: baseResponseRate * 100,
      meetingConversionRate: baseMeetingRate * 100,
      closingRate: baseClosingRate * 100,
      dealsClosed: baseDeals,
      avgSetupFee: Math.round(avgSetup),
      avgMonthlyFee: Math.round(avgMonthly),
      upfrontRevenue: Math.round(baseUpfront),
      firstYearArr: Math.round(baseArr),
      estimatedCac: Math.round(baseCac),
      paybackMonths: basePayback
    },
    {
      name: 'Otimista',
      prospectableCompanies: total,
      effectiveContactRate: optContactRate * 100,
      responseRate: optResponseRate * 100,
      meetingConversionRate: optMeetingRate * 100,
      closingRate: optClosingRate * 100,
      dealsClosed: optDeals,
      avgSetupFee: Math.round(avgSetup * 1.25),
      avgMonthlyFee: Math.round(avgMonthly * 1.2),
      upfrontRevenue: Math.round(optUpfront),
      firstYearArr: Math.round(optArr),
      estimatedCac: Math.round(baseCac * 0.75),
      paybackMonths: optPayback
    }
  ];
}

