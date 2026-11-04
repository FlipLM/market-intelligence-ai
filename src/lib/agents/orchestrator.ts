import { NicheReport } from '@/types/market';
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

export interface ResearchProgressLog {
  step: number;
  agentName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message: string;
  timestamp: string;
}

export function executeNicheResearch(input: DiscoveryInput): NicheReport {
  const now = new Date().toISOString();
  const weights = getScoringWeights();

  // Agente 1: Descoberta de Nichos
  const basicInfo = runNicheDiscoveryAgent(input);

  // Agente 2: Inteligência de Demanda
  const demand = runDemandIntelligenceAgent(basicInfo.name);

  // Agente 3: Inteligência de Tráfego Pago
  const paidTraffic = runPaidTrafficAgent(basicInfo.name);

  // Agente 4: Inteligência Competitiva
  const competition = runCompetitiveIntelligenceAgent(basicInfo.name);

  // Agente 5: Problemas Operacionais & Oportunidades de Software
  const opportunities = runSoftwareOpportunityAgent(basicInfo.name);

  // Agente 6: Viabilidade Comercial
  const commercialViability = runCommercialViabilityAgent(basicInfo.name, input.state);

  // Sistema de Pontuação e Classificação Multicritério
  const scoring = calculateNicheScore({
    demand,
    paidTraffic,
    competition,
    viability: commercialViability,
    opportunities
  }, weights);

  // Simulador de Cenários Financeiros (Conservador, Base, Otimista)
  const financialScenarios = generateFinancialScenarios(commercialViability);

  // Agente 7: Analista de Decisão & Síntese
  const decision = runDecisionAnalystAgent({
    basicInfo,
    demand,
    paidTraffic,
    competition,
    opportunities,
    viability: commercialViability,
    scoring
  });

  // Agente 8: Auditor Técnico de TI & Engenharia de Software
  const techAudit = runTechAuditorAgent({
    basicInfo,
    opportunities,
    viability: commercialViability,
    competition
  });

  // Agente 9: Estrategista de Abordagem & Copywriter B2B
  const outreachCopy = runOutreachCopywriterAgent({
    basicInfo,
    opportunities,
    viability: commercialViability
  });

  const report: NicheReport = {
    id: basicInfo.id,
    createdAt: now,
    updatedAt: now,
    basicInfo,
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
    outreachCopy
  };

  saveNiche(report);
  return report;
}
