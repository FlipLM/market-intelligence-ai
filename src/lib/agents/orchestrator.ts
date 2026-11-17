import { NicheReport, NicheBaseAggregation } from '@/types/market';
import { getScoringWeights, saveNiche } from '../db';
import { runNicheDiscoveryAgent, DiscoveryInput } from './nicheDiscoveryAgent';
import { runDemandIntelligenceAgent } from './demandIntelligenceAgent';
import { runPaidTrafficAgent } from './paidTrafficAgent';
import { runCompetitiveIntelligenceAgent } from './competitiveIntelligenceAgent';
import { runSoftwareOpportunityAgent } from './softwareOpportunityAgent';
import { runCommercialViabilityAgent } from './commercialViabilityAgent';
import { calculateNicheScore } from '../scoring';
import { generateFinancialScenarios } from '../simulator';
import { runDecisionAnalystAgent } from './decisionAnalystAgent';
import { runTechAuditorAgent } from './techAuditorAgent';
import { runOutreachCopywriterAgent } from './outreachCopywriterAgent';
import { desconhecido } from '@/types/provenance';

export function emptyBaseAggregation(): NicheBaseAggregation {
  const fonte = 'Sem CNPJs reais coletados para este CNAE na base local';
  return {
    totalEmpresasColetadas: desconhecido(fonte),
    abertasUltimos30Dias: desconhecido(fonte),
    abertasUltimos90Dias: desconhecido(fonte),
    abertasUltimos365Dias: desconhecido(fonte),
    taxaAberturaMensal: desconhecido(fonte),
    concentracaoPorBairro: desconhecido(fonte),
    distribuicaoPorPorte: desconhecido(fonte),
  };
}

export function executeNicheResearch(input: DiscoveryInput): NicheReport {
  const now = new Date().toISOString();
  const weights = getScoringWeights();

  const basicInfo = runNicheDiscoveryAgent(input);
  const demand = runDemandIntelligenceAgent();
  const paidTraffic = runPaidTrafficAgent();
  const competition = runCompetitiveIntelligenceAgent();
  const opportunities = runSoftwareOpportunityAgent();
  const commercialViability = runCommercialViabilityAgent();

  const scoring = calculateNicheScore(
    {
      demand,
      paidTraffic,
      competition,
      viability: commercialViability,
      opportunities,
    },
    weights
  );

  const financialScenarios = generateFinancialScenarios();
  const decision = runDecisionAnalystAgent({
    basicInfo,
    viability: commercialViability,
    scoring,
  });
  const techAudit = runTechAuditorAgent();
  const outreachCopy = runOutreachCopywriterAgent();

  const report: NicheReport = {
    id: basicInfo.id,
    recordStatus: 'ativo',
    createdAt: now,
    updatedAt: now,
    basicInfo,
    baseAggregation: emptyBaseAggregation(),
    demand,
    paidTraffic,
    competition,
    opportunities,
    commercialViability,
    scoring,
    financialScenarios,
    whyEnterArguments: decision.whyEnterArguments,
    whyNotEnterRisks: decision.whyNotEnterRisks,
    decisionRecommendation: decision.decisionRecommendation,
    recommendedAction: decision.recommendedAction,
    dataSufficiency: decision.dataSufficiency,
    techAudit,
    outreachCopy,
  };

  saveNiche(report);
  return report;
}
