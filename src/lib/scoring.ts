import { 
  ScoringWeights, 
  ScoreItem, 
  NicheScoreBreakdown, 
  MetricConfidence, 
  DemandAnalysis,
  PaidTrafficAnalysis,
  CompetitiveAnalysis,
  CommercialViability,
  SoftwareOpportunity,
  DataEvidence
} from '@/types/market';

interface EvaluationContext {
  demand: DemandAnalysis;
  paidTraffic: PaidTrafficAnalysis;
  competition: CompetitiveAnalysis;
  viability: CommercialViability;
  opportunities: SoftwareOpportunity[];
}

export function calculateNicheScore(
  ctx: EvaluationContext, 
  weights: ScoringWeights
): NicheScoreBreakdown {
  const items: ScoreItem[] = [];

  // 1. Demanda comprovada por soluções digitais (20%)
  const demandEvidences = ctx.demand.evidences.filter(e => e.origin === 'observado');
  const techTermsCount = ctx.demand.trendingQueries.filter(q => q.intent === 'tecnologica').length;
  let demandRaw = ctx.demand.overallDemandScore;
  let demandConf: MetricConfidence = demandEvidences.length >= 2 ? 'alta' : demandEvidences.length === 1 ? 'media' : 'baixa';
  
  items.push({
    name: 'Demanda comprovada por soluções digitais',
    weight: weights.demandaComprovada,
    rawScore: demandRaw,
    weightedScore: Number((demandRaw * weights.demandaComprovada).toFixed(2)),
    confidence: demandConf,
    justification: `Identificados ${techTermsCount} termos específicos com intenção tecnológica e ${demandEvidences.length} evidências observadas diretamente no setor.`
  });

  // 2. Intensidade dos problemas operacionais (15%)
  const highPainOppCount = ctx.opportunities.filter(o => o.complexity !== 'baixa').length;
  const rawPainScore = Math.min(100, ctx.opportunities.length * 20 + highPainOppCount * 10);
  items.push({
    name: 'Intensidade dos problemas operacionais',
    weight: weights.problemasOperacionais,
    rawScore: rawPainScore,
    weightedScore: Number((rawPainScore * weights.problemasOperacionais).toFixed(2)),
    confidence: 'alta',
    justification: `${ctx.opportunities.length} pontos críticos de ineficiência operacional mapeados com impacto direto em perda de receita/tempo.`
  });

  // 3. Capacidade e disposição de investimento (15%)
  let capacityRaw = 50;
  if (ctx.viability.averageCompanyRevenueEstimate.includes('R$ 200 mil') || ctx.viability.averageCompanyRevenueEstimate.includes('R$ 500 mil') || ctx.viability.averageCompanyRevenueEstimate.includes('milhões')) {
    capacityRaw = 85;
  } else if (ctx.viability.averageCompanyRevenueEstimate.includes('R$ 80 mil') || ctx.viability.averageCompanyRevenueEstimate.includes('R$ 100 mil')) {
    capacityRaw = 70;
  } else {
    capacityRaw = 55;
  }
  items.push({
    name: 'Capacidade e disposição de investimento',
    weight: weights.capacidadeInvestimento,
    rawScore: capacityRaw,
    weightedScore: Number((capacityRaw * weights.capacidadeInvestimento).toFixed(2)),
    confidence: 'media',
    justification: `Estimativa de faturamento médio e histórico de contratação de serviços corporativos: ${ctx.viability.averageCompanyRevenueEstimate}.`
  });

  // 4. Facilidade de prospecção e acesso aos decisores (15%)
  let decisionScore = 60;
  if (ctx.viability.accessibleDecisionMakers === 'direto') decisionScore = 95;
  else if (ctx.viability.accessibleDecisionMakers === 'acessivel') decisionScore = 80;
  else if (ctx.viability.accessibleDecisionMakers === 'moderado') decisionScore = 60;
  else decisionScore = 35;

  items.push({
    name: 'Facilidade de prospecção e acesso aos decisores',
    weight: weights.facilidadeProspeccao,
    rawScore: decisionScore,
    weightedScore: Number((decisionScore * weights.facilidadeProspeccao).toFixed(2)),
    confidence: 'alta',
    justification: `Acessibilidade de contato via WhatsApp/Telefone e presença do proprietário na operação classificada como "${ctx.viability.accessibleDecisionMakers}".`
  });

  // 5. Potencial de recorrência (10%)
  let recurrenceScore = 70;
  if (ctx.viability.reusabilityPotential === 'saas_escalavel') recurrenceScore = 95;
  else if (ctx.viability.reusabilityPotential === 'customizavel') recurrenceScore = 80;
  else recurrenceScore = 40;

  items.push({
    name: 'Potencial de recorrência',
    weight: weights.potencialRecorrencia,
    rawScore: recurrenceScore,
    weightedScore: Number((recurrenceScore * weights.potencialRecorrencia).toFixed(2)),
    confidence: 'alta',
    justification: `Aderência à cobrança de manutenção, licença contínua ou hospedagem/suporte classificada como "${ctx.viability.reusabilityPotential}".`
  });

  // 6. Oportunidade competitiva (10%)
  let compScore = 60;
  if (ctx.competition.marketSaturation === 'subatendido') compScore = 95;
  else if (ctx.competition.marketSaturation === 'dominado_por_legados') compScore = 85;
  else if (ctx.competition.marketSaturation === 'moderado') compScore = 65;
  else compScore = 30;

  items.push({
    name: 'Oportunidade competitiva',
    weight: weights.oportunidadeCompetitiva,
    rawScore: compScore,
    weightedScore: Number((compScore * weights.oportunidadeCompetitiva).toFixed(2)),
    confidence: 'alta',
    justification: `Saturação do mercado: "${ctx.competition.marketSaturation}". Ângulo de ataque: ${ctx.competition.differentiationAngle}.`
  });

  // 7. Viabilidade técnica e operacional (10%)
  const avgDevDays = ctx.opportunities.reduce((acc, curr) => acc + curr.typicalDevelopmentDays, 0) / (ctx.opportunities.length || 1);
  let techViabilityScore = 80;
  if (avgDevDays <= 15) techViabilityScore = 95;
  else if (avgDevDays <= 30) techViabilityScore = 80;
  else if (avgDevDays <= 60) techViabilityScore = 55;
  else techViabilityScore = 35;

  items.push({
    name: 'Viabilidade técnica e operacional',
    weight: weights.viabilidadeTecnica,
    rawScore: techViabilityScore,
    weightedScore: Number((techViabilityScore * weights.viabilidadeTecnica).toFixed(2)),
    confidence: 'alta',
    justification: `Prazo médio estimado de desenvolvimento de MVP: ${Math.round(avgDevDays)} dias úteis sem bloqueadores regulatórios intransponíveis.`
  });

  // 8. Qualidade das evidências (5%)
  const allEvidences: DataEvidence[] = [
    ...ctx.demand.evidences,
    ...ctx.paidTraffic.evidences,
    ...ctx.competition.evidences,
    ...ctx.viability.evidences
  ];
  const observedCount = allEvidences.filter(e => e.origin === 'observado').length;
  const evidenceScore = Math.min(100, Math.round((observedCount / Math.max(1, allEvidences.length)) * 100));

  items.push({
    name: 'Qualidade das evidências',
    weight: weights.qualidadeEvidencias,
    rawScore: evidenceScore,
    weightedScore: Number((evidenceScore * weights.qualidadeEvidencias).toFixed(2)),
    confidence: observedCount >= 4 ? 'comprovada' : 'media',
    justification: `${observedCount} de ${allEvidences.length} evidências extraídas de fontes públicas verificadas (sem suposições não declaradas).`
  });

  // Cálculo da pontuação total ponderada
  const sumWeights = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalWeighted = items.reduce((sum, item) => sum + item.weightedScore, 0);
  const normalizedFinalScore = Math.round((totalWeighted / (sumWeights || 1)));

  // Índice de Confiança Geral (baseado em evidências e completude)
  const confidenceIndex = Math.min(100, Math.round(evidenceScore * 0.5 + (observedCount >= 5 ? 50 : 25)));

  let commercialPotential: NicheScoreBreakdown['commercialPotential'] = 'moderado';
  if (normalizedFinalScore >= 80) commercialPotential = 'excepcional';
  else if (normalizedFinalScore >= 70) commercialPotential = 'alto';
  else if (normalizedFinalScore >= 50) commercialPotential = 'moderado';
  else commercialPotential = 'baixo';

  let entryEase: NicheScoreBreakdown['entryEase'] = 'moderada';
  if (decisionScore >= 80 && compScore >= 75) entryEase = 'facil';
  else if (decisionScore <= 50 || compScore <= 40) entryEase = 'dificil';

  let executionRisk: NicheScoreBreakdown['executionRisk'] = 'moderado';
  if (techViabilityScore >= 85 && ctx.viability.regulatoryRisks.length === 0) executionRisk = 'baixo';
  else if (techViabilityScore <= 50 || ctx.viability.regulatoryRisks.length >= 2) executionRisk = 'alto';

  return {
    finalScore: normalizedFinalScore,
    confidenceIndex,
    commercialPotential,
    entryEase,
    executionRisk,
    digitalMaturity: ctx.demand.digitalizationNeedLevel === 'critica' || ctx.demand.digitalizationNeedLevel === 'alta' ? 'em_transicao' : 'madura',
    competitiveIntensity: ctx.paidTraffic.auctionCompetition === 'feroz' || ctx.paidTraffic.auctionCompetition === 'alta' ? 'alta' : 'baixa',
    items
  };
}

