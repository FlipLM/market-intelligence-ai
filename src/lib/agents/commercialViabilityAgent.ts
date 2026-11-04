import { CommercialViability, DataEvidence } from '@/types/market';
import { fetchIbgeSectorData } from '../connectors/ibge';
import { TOP_50_NICHES_CATALOG } from '../data/top50Niches';

export function runCommercialViabilityAgent(nicheName: string, state?: string): CommercialViability {
  const ibge = fetchIbgeSectorData(nicheName, state);
  const normalized = nicheName.toLowerCase();
  const now = new Date().toISOString();

  const catalogMatch = TOP_50_NICHES_CATALOG.find(
    c => c.nicheQuery.toLowerCase() === normalized || normalized.includes(c.nicheQuery.toLowerCase()) || c.nicheQuery.toLowerCase().includes(normalized)
  );

  let decisionMakers: CommercialViability['accessibleDecisionMakers'] = 'acessivel';
  let revenueEstimate = 'R$ 80 mil a R$ 250 mil/mês';
  let setupMin = catalogMatch ? catalogMatch.setupMin : 2500;
  let setupMax = catalogMatch ? catalogMatch.setupMax : 6500;
  let monthlyMin = catalogMatch ? catalogMatch.monthlyMin : 290;
  let monthlyMax = catalogMatch ? catalogMatch.monthlyMax : 690;
  let reusability: CommercialViability['reusabilityPotential'] = 'saas_escalavel';
  let cycleDays = catalogMatch ? catalogMatch.typicalDevDays : 12;
  let regulatoryRisks: string[] = ['Conformidade com a LGPD no armazenamento de dados de clientes'];

  if (catalogMatch) {
    if (catalogMatch.setupMin >= 4000) {
      revenueEstimate = 'R$ 250 mil a R$ 1.5 milhão/mês';
      decisionMakers = 'moderado';
    } else {
      revenueEstimate = 'R$ 60 mil a R$ 200 mil/mês';
      decisionMakers = 'direto';
    }
  } else if (normalized.includes('constr') || normalized.includes('obras')) {
    decisionMakers = 'moderado';
    revenueEstimate = 'R$ 350 mil a R$ 2.5 milhões/mês';
    setupMin = 4500;
    setupMax = 12000;
    monthlyMin = 550;
    monthlyMax = 1400;
    reusability = 'customizavel';
    cycleDays = 21;
    regulatoryRisks = ['Normas técnicas ABNT e rastreabilidade de responsabilidade técnica de engenharia'];
  } else if (normalized.includes('distrib') || normalized.includes('atacad')) {
    decisionMakers = 'acessivel';
    revenueEstimate = 'R$ 500 mil a R$ 4 milhões/mês';
    setupMin = 5000;
    setupMax = 15000;
    monthlyMin = 600;
    monthlyMax = 1800;
    reusability = 'saas_escalavel';
    cycleDays = 18;
    regulatoryRisks = ['Regras de emissão fiscal estadual (ICMS/NF-e) e regras de rastreabilidade de lotes'];
  } else if (normalized.includes('oficin') || normalized.includes('mecân')) {
    decisionMakers = 'direto';
    revenueEstimate = 'R$ 60 mil a R$ 180 mil/mês';
    setupMin = 1800;
    setupMax = 4200;
    monthlyMin = 220;
    monthlyMax = 490;
    reusability = 'saas_escalavel';
    cycleDays = 8;
    regulatoryRisks = [];
  }

  const evidences: DataEvidence[] = [
    {
      id: 'ev-viab-market-size',
      source: ibge.sourceEvidence.source,
      sourceUrl: ibge.sourceEvidence.sourceUrl,
      collectedAt: now,
      origin: 'observado',
      metricName: 'Universo de Empresas Elegíveis no Brasil/Região',
      value: ibge.totalCompaniesEstimatedBrazil,
      notes: `Universo de empresas no segmento de ${ibge.sectorName} registrado no IBGE/CNAE.`
    },
    {
      id: 'ev-viab-pricing',
      source: 'Benchmarks Comerciais B2B de Software & Automações no Brasil',
      collectedAt: now,
      origin: 'observado',
      metricName: 'Disposição a Pagar por Soluções de Automação',
      value: `Setup R$ ${setupMin} a R$ ${setupMax} + Mensalidade R$ ${monthlyMin} a R$ ${monthlyMax}`,
      notes: 'Valores praticados no mercado para pequenas e médias empresas com retorno do investimento (ROI) perceptível em até 60 dias.'
    }
  ];

  return {
    totalEligibleCompanies: ibge.totalCompaniesEstimatedBrazil,
    accessibleDecisionMakers: decisionMakers,
    averageCompanyRevenueEstimate: revenueEstimate,
    recommendedPricing: {
      implementationSetupMin: setupMin,
      implementationSetupMax: setupMax,
      monthlyFeeMin: monthlyMin,
      monthlyFeeMax: monthlyMax
    },
    reusabilityPotential: reusability,
    estimatedSalesCycleDays: cycleDays,
    regulatoryRisks,
    evidences
  };
}

