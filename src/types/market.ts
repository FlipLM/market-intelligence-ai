import { ProvenanceField, ProvenanceStatus } from './provenance';

/**
 * Market Intelligence AI - Contratos de Tipos e Interfaces com Proveniência
 */

export type MetricConfidence = 'baixa' | 'media' | 'alta';

export interface DataEvidence {
  id: string;
  source: string;
  sourceUrl?: string;
  collectedAt: string;
  status: ProvenanceStatus;
  metricName: string;
  value: string | number;
  notes: string;
}

export interface NicheBasicInfo {
  id: string;
  name: ProvenanceField<string>;
  segment: ProvenanceField<string>;
  subsegment: ProvenanceField<string>;
  cnaes: ProvenanceField<string[]>;
  cnaeDescricao: ProvenanceField<string>;
  description: ProvenanceField<string>;
  geographicScope: {
    country: ProvenanceField<string>;
    state: ProvenanceField<string>;
    city: ProvenanceField<string>;
  };
}

export interface NicheBaseAggregation {
  totalEmpresasColetadas: ProvenanceField<number>;
  abertasUltimos30Dias: ProvenanceField<number>;
  abertasUltimos90Dias: ProvenanceField<number>;
  abertasUltimos365Dias: ProvenanceField<number>;
  taxaAberturaMensal: ProvenanceField<number>;
  concentracaoPorBairro: ProvenanceField<Array<{ bairro: string; quantidade: number }>>;
  distribuicaoPorPorte: ProvenanceField<Array<{ porte: string; quantidade: number }>>;
}

export interface TrendingQueryItem {
  term: string;
  trend: 'alta' | 'estavel' | 'queda';
  intent: 'comercial' | 'informacional' | 'tecnologica';
}

export interface DemandAnalysis {
  overallDemandScore: ProvenanceField<number>;
  serviceSearchVolume: ProvenanceField<string>;
  softwareSearchVolume: ProvenanceField<string>;
  ratioExplanation: ProvenanceField<string>;
  trendingQueries: ProvenanceField<TrendingQueryItem[]>;
  operationalPainMentions: ProvenanceField<string[]>;
  digitalizationNeedLevel: ProvenanceField<'baixa' | 'media' | 'alta' | 'critica'>;
  seasonality: ProvenanceField<string>;
  evidences: DataEvidence[];
}

export interface PaidTrafficAnalysis {
  hasPaidAdsIdentified: ProvenanceField<boolean>;
  advertiserCount: ProvenanceField<string>;
  averageCpc: ProvenanceField<number>;
  cpcRange: ProvenanceField<{ min: number; max: number }>;
  auctionCompetition: ProvenanceField<'baixa' | 'media' | 'alta' | 'feroz'>;
  observedKeywords: ProvenanceField<
    Array<{
      keyword: string;
      estimatedCpc: number;
      competition: string;
      intent: string;
    }>
  >;
  acquisitionDifficulty: ProvenanceField<'facil' | 'moderada' | 'dificil' | 'desafiadora'>;
  evidences: DataEvidence[];
}

export interface CompetitorItem {
  name: string;
  type: 'saas_especifico' | 'erp_generico' | 'agencia' | 'planilhas_manuais';
  pricingModel: string;
  strengths: string[];
  weaknesses: string[];
}

export interface CompetitiveAnalysis {
  marketSaturation: ProvenanceField<'subatendido' | 'moderado' | 'saturado' | 'dominado_por_legados'>;
  mainCompetitors: ProvenanceField<CompetitorItem[]>;
  entryBarriers: ProvenanceField<string[]>;
  differentiationAngle: ProvenanceField<string>;
  opportunityType: ProvenanceField<'substituicao' | 'complementacao_integracao' | 'inovacao_nicho'>;
  evidences: DataEvidence[];
}

export interface SoftwareOpportunity {
  id: string;
  isAiHypothesis: boolean;
  title: ProvenanceField<string>;
  operationalProblem: ProvenanceField<string>;
  evidence: ProvenanceField<string>;
  digitalSolution: ProvenanceField<string>;
  expectedBenefit: ProvenanceField<string>;
  typicalDevelopmentDays: ProvenanceField<number>;
  complexity: ProvenanceField<'baixa' | 'media' | 'alta'>;
}

export interface CommercialViability {
  totalEligibleCompanies: ProvenanceField<number>;
  accessibleDecisionMakers: ProvenanceField<'muito_dificil' | 'moderado' | 'acessivel' | 'direto'>;
  averageCompanyRevenue: ProvenanceField<string>;
  recommendedPricing: {
    implementationSetupMin: ProvenanceField<number>;
    implementationSetupMax: ProvenanceField<number>;
    monthlyFeeMin: ProvenanceField<number>;
    monthlyFeeMax: ProvenanceField<number>;
  };
  reusabilityPotential: ProvenanceField<'projeto_unico' | 'customizavel' | 'saas_escalavel'>;
  estimatedSalesCycleDays: ProvenanceField<number>;
  regulatoryRisks: ProvenanceField<string[]>;
  evidences: DataEvidence[];
}

export interface ScoringWeights {
  demandaComprovada: number;
  problemasOperacionais: number;
  capacidadeInvestimento: number;
  facilidadeProspeccao: number;
  potencialRecorrencia: number;
  oportunidadeCompetitiva: number;
  viabilidadeTecnica: number;
  qualidadeEvidencias: number;
}

export interface ScoreItem {
  key: keyof ScoringWeights;
  name: string;
  weight: number;
  rawScore: number | null;
  weightedScore: number | null;
  status: ProvenanceStatus;
  fonte: string;
  consultado_em: string | null;
  justification: string;
}

export interface NicheScoreBreakdown {
  finalScore: number | null;
  confidenceLevel: MetricConfidence;
  confidenceFraction: number;
  evidencedCriteriaCount: number;
  totalCriteriaCount: number;
  commercialPotential: ProvenanceField<'baixo' | 'moderado' | 'alto' | 'excepcional'>;
  entryEase: ProvenanceField<'dificil' | 'moderada' | 'facil'>;
  executionRisk: ProvenanceField<'baixo' | 'moderado' | 'alto'>;
  items: ScoreItem[];
}

export interface HypotheticalAssumptions {
  prospectableCompanies: number;
  effectiveContactRate: number;
  responseRate: number;
  meetingConversionRate: number;
  closingRate: number;
  avgSetupFee: number;
  avgMonthlyFee: number;
  estimatedCac: number;
}

export interface FinancialScenario {
  name: 'Conservador' | 'Base' | 'Otimista' | 'Personalizado';
  isHypotheticalScenario: true;
  disclaimer: string;
  assumptions: HypotheticalAssumptions;
  dealsClosed: number;
  upfrontRevenue: number;
  firstYearArr: number;
  paybackMonths: number | null;
}

export interface TechAuditAnalysis {
  isAiHypothesis: true;
  disclaimer: string;
  verdict: ProvenanceField<'altamente_viavel' | 'viavel_com_escopo_fechado' | 'alto_suporte_risco' | 'nao_recomendado'>;
  verdictTitle: ProvenanceField<string>;
  verdictReason: ProvenanceField<string>;
  architectureComplexity: ProvenanceField<'baixa' | 'media' | 'alta' | 'complexa'>;
  recommendedTechStack: ProvenanceField<{
    frontend: string;
    backendAndDb: string;
    authAndSecurity: string;
    integrations: string[];
  }>;
  pitfallsToAvoid: ProvenanceField<string[]>;
}

export interface OutreachCopyBriefing {
  disclaimer: string;
  templatePadrao: string;
  regraFollowup: string;
  targetPersona: ProvenanceField<{
    role: string;
    dailyFrustrations: string[];
    buyingTriggers: string[];
  }>;
}

export interface NicheReport {
  id: string;
  recordStatus: 'ativo' | 'descartado_sintetico';
  createdAt: string;
  updatedAt: string;
  basicInfo: NicheBasicInfo;
  baseAggregation: NicheBaseAggregation;
  demand: DemandAnalysis;
  paidTraffic: PaidTrafficAnalysis;
  competition: CompetitiveAnalysis;
  opportunities: SoftwareOpportunity[];
  commercialViability: CommercialViability;
  scoring: NicheScoreBreakdown;
  financialScenarios: FinancialScenario[];
  whyEnterArguments: ProvenanceField<string[]>;
  whyNotEnterRisks: ProvenanceField<string[]>;
  decisionRecommendation: ProvenanceField<string>;
  recommendedAction: 'avancar_imediatamente' | 'testar_com_piloto' | 'monitorar' | 'pesquisa_manual_necessaria';
  dataSufficiency: 'insuficiente' | 'parcial' | 'completa';
  techAudit?: TechAuditAnalysis;
  outreachCopy?: OutreachCopyBriefing;
}

export interface DiscardedSyntheticNicheRecord {
  id: string;
  name: string;
  originalCreatedAt: string;
  recordStatus: 'descartado_sintetico';
  discardedAt: string;
  reason: string;
}

export interface CommercialFeedbackHistory {
  id: string;
  nicheId: string;
  nicheName: string;
  recordedAt: string;
  companiesApproached: number;
  contactsMade: number;
  responsesReceived: number;
  meetingsBooked: number;
  proposalsSent: number;
  dealsClosed: number;
  negotiatedAvgTicket: number;
  lostReasons: string[];
  observedFriction: string;
  strategyAdjustments: string;
}

export interface ProspectorHandoff {
  nicheId: string;
  nicheName: ProvenanceField<string>;
  googleMapsQuery: ProvenanceField<string>;
  targetRegion: ProvenanceField<string>;
  idealCustomerProfile: {
    description: ProvenanceField<string>;
    companySize: ProvenanceField<string>;
    mustHaveCellPhone: boolean;
  };
  suggestedPitchWhatsApp: string;
  diagnosticQuestions: string[];
  offerValueProposition: ProvenanceField<string>;
}
