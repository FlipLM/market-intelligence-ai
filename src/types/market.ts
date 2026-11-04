/**
 * Market Intelligence AI - Contratos de Tipos e Interfaces
 */

export type MetricConfidence = 'baixa' | 'media' | 'alta' | 'comprovada';

export type EvidenceOrigin = 'observado' | 'estimado' | 'hipotese' | 'inferencia_ia';

export interface DataEvidence {
  id: string;
  source: string;
  sourceUrl?: string;
  collectedAt: string;
  origin: EvidenceOrigin;
  metricName: string;
  value: string | number;
  notes: string;
}

export interface NicheBasicInfo {
  id: string;
  name: string;
  segment: string;
  subsegment?: string;
  cnaes: string[];
  description: string;
  geographicScope: {
    country: string;
    state?: string;
    city?: string;
  };
}

export interface DemandAnalysis {
  overallDemandScore: number; // 0-100
  serviceDemandVsSoftwareDemand: {
    serviceSearchVolumeEstimated: string;
    softwareSearchVolumeEstimated: string;
    ratioExplanation: string;
  };
  trendingQueries: Array<{
    term: string;
    trend: 'alta' | 'estavel' | 'queda';
    intent: 'comercial' | 'informacional' | 'tecnologica';
  }>;
  operationalPainMentions: string[];
  digitalizationNeedLevel: 'baixa' | 'media' | 'alta' | 'critica';
  seasonality: string;
  evidences: DataEvidence[];
}

export interface PaidTrafficAnalysis {
  hasPaidAdsIdentified: boolean;
  advertiserCountEstimate: string;
  estimatedAverageCpc: number; // em BRL
  cpcRange: { min: number; max: number };
  auctionCompetition: 'baixa' | 'media' | 'alta' | 'feroz';
  observedKeywords: Array<{
    keyword: string;
    estimatedCpc: number;
    competition: string;
    intent: string;
  }>;
  adCopyInsights: Array<{
    headline: string;
    valueProposition: string;
    callToAction: string;
    targetAudience: string;
  }>;
  landingPageConversionTactics: string[];
  acquisitionDifficulty: 'facil' | 'moderada' | 'dificil' | 'desafiadora';
  evidences: DataEvidence[];
}

export interface CompetitiveAnalysis {
  marketSaturation: 'subatendido' | 'moderado' | 'saturado' | 'dominado_por_legados';
  mainCompetitors: Array<{
    name: string;
    type: 'saas_especifico' | 'erp_generico' | 'agencia' | 'planilhas_manuais';
    pricingModel: string;
    strengths: string[];
    weaknesses: string[];
    commonComplaints: string[];
  }>;
  entryBarriers: string[];
  differentiationAngle: string;
  opportunityType: 'substituicao' | 'complementacao_integracao' | 'inovacao_nicho';
  evidences: DataEvidence[];
}

export interface SoftwareOpportunity {
  id: string;
  title: string;
  operationalProblem: string;
  evidence: string;
  digitalSolution: string;
  expectedBenefit: string;
  willingnessToPayHypothesis: 'baixa' | 'media' | 'alta' | 'muito_alta';
  typicalDevelopmentDays: number;
  complexity: 'baixa' | 'media' | 'alta';
}

export interface CommercialViability {
  totalEligibleCompanies: number;
  accessibleDecisionMakers: 'muito_dificil' | 'moderado' | 'acessivel' | 'direto';
  averageCompanyRevenueEstimate: string;
  recommendedPricing: {
    implementationSetupMin: number;
    implementationSetupMax: number;
    monthlyFeeMin: number;
    monthlyFeeMax: number;
  };
  reusabilityPotential: 'projeto_unico' | 'customizavel' | 'saas_escalavel';
  estimatedSalesCycleDays: number;
  regulatoryRisks: string[];
  evidences: DataEvidence[];
}

export interface ScoringWeights {
  demandaComprovada: number;      // Padrão 0.20
  problemasOperacionais: number;  // Padrão 0.15
  capacidadeInvestimento: number; // Padrão 0.15
  facilidadeProspeccao: number;   // Padrão 0.15
  potencialRecorrencia: number;   // Padrão 0.10
  oportunidadeCompetitiva: number;// Padrão 0.10
  viabilidadeTecnica: number;     // Padrão 0.10
  qualidadeEvidencias: number;    // Padrão 0.05
}

export interface ScoreItem {
  name: string;
  weight: number;
  rawScore: number; // 0 a 100
  weightedScore: number;
  confidence: MetricConfidence;
  justification: string;
}

export interface NicheScoreBreakdown {
  finalScore: number; // 0-100
  confidenceIndex: number; // 0-100%
  commercialPotential: 'baixo' | 'moderado' | 'alto' | 'excepcional';
  entryEase: 'dificil' | 'moderada' | 'facil';
  executionRisk: 'baixo' | 'moderado' | 'alto';
  digitalMaturity: 'rudimentar' | 'em_transicao' | 'madura';
  competitiveIntensity: 'baixa' | 'media' | 'alta';
  items: ScoreItem[];
}

export interface FinancialScenario {
  name: 'Conservador' | 'Base' | 'Otimista';
  prospectableCompanies: number;
  effectiveContactRate: number; // %
  responseRate: number; // %
  meetingConversionRate: number; // %
  closingRate: number; // %
  dealsClosed: number;
  avgSetupFee: number;
  avgMonthlyFee: number;
  upfrontRevenue: number;
  firstYearArr: number;
  estimatedCac: number;
  paybackMonths: number;
}

export interface TechAuditAnalysis {
  verdict: 'altamente_viavel' | 'viavel_com_escopo_fechado' | 'alto_suporte_risco' | 'nao_recomendado';
  verdictTitle: string;
  verdictReason: string;
  devEffortVsRoiScore: number; // 0 a 100
  architectureComplexity: 'baixa' | 'media' | 'alta' | 'complexa';
  recommendedTechStack: {
    frontend: string;
    backendAndDb: string;
    authAndSecurity: string;
    integrations: string[];
  };
  reusabilityPercentageEstimated: number; // ex: 80%
  pitfallsToAvoid: string[];
  maintenanceBurdenLevel: 'baixo' | 'moderado' | 'alto';
  mvpDeliveryTargetDays: number;
}

export interface OutreachCopyBriefing {
  targetPersona: {
    role: string;
    dailyFrustrations: string[];
    buyingTriggers: string[];
  };
  whatsAppCadence: Array<{
    step: string;
    timing: string;
    messageText: string;
    purpose: string;
  }>;
  coldCallScript: {
    gatekeeperPitch: string;
    decisionMakerPitch: string;
  };
  spinQuestions: {
    situation: string;
    problem: string;
    implication: string;
    needPayoff: string;
  };
  objectionsAndRebuttals: Array<{
    objection: string;
    rebuttal: string;
  }>;
}

export interface NicheReport {
  id: string;
  createdAt: string;
  updatedAt: string;
  basicInfo: NicheBasicInfo;
  demand: DemandAnalysis;
  paidTraffic: PaidTrafficAnalysis;
  competition: CompetitiveAnalysis;
  opportunities: SoftwareOpportunity[];
  commercialViability: CommercialViability;
  scoring: NicheScoreBreakdown;
  financialScenarios: FinancialScenario[];
  whyEnterArguments: string[];
  whyNotEnterRisks: string[];
  decisionRecommendation: string;
  recommendedAction: 'avancar_imediatamente' | 'testar_com_piloto' | 'monitorar' | 'descartar';
  dataSufficiency: 'insuficiente' | 'parcial' | 'completa';
  techAudit?: TechAuditAnalysis;
  outreachCopy?: OutreachCopyBriefing;
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
  nicheName: string;
  googleMapsQuery: string;
  targetRegion: string;
  idealCustomerProfile: {
    description: string;
    companySize: string;
    hasWebsitePreferred: boolean;
    mustHaveCellPhone: boolean;
  };
  suggestedPitchWhatsApp: string;
  diagnosticQuestions: string[];
  offerValueProposition: string;
}

