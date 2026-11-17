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
  DataEvidence,
} from '@/types/market';
import { desconhecido, hasEvidence, inferido } from '@/types/provenance';

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

  // 1. Demanda comprovada
  const hasDemandScore = hasEvidence(ctx.demand.overallDemandScore);
  items.push({
    key: 'demandaComprovada',
    name: 'Demanda comprovada por soluções digitais',
    weight: weights.demandaComprovada,
    rawScore: hasDemandScore ? ctx.demand.overallDemandScore.valor! : null,
    weightedScore: hasDemandScore
      ? Number((ctx.demand.overallDemandScore.valor! * weights.demandaComprovada).toFixed(2))
      : null,
    status: hasDemandScore ? ctx.demand.overallDemandScore.status : 'desconhecido',
    fonte: ctx.demand.overallDemandScore.fonte,
    consultado_em: ctx.demand.overallDemandScore.consultado_em,
    justification: hasDemandScore
      ? `Pontuação baseada em ${ctx.demand.evidences.length} evidência(s) registrada(s).`
      : 'Não verificado: sem dados observados de demanda.',
  });

  // 2. Problemas operacionais (somente se houver oportunidades não-hipótese com evidência)
  const evidencedOpps = ctx.opportunities.filter(
    (o) => !o.isAiHypothesis && hasEvidence(o.evidence)
  );
  const hasPain = evidencedOpps.length > 0;
  const painScore = hasPain ? Math.min(100, evidencedOpps.length * 25) : null;
  items.push({
    key: 'problemasOperacionais',
    name: 'Intensidade dos problemas operacionais',
    weight: weights.problemasOperacionais,
    rawScore: painScore,
    weightedScore:
      painScore !== null
        ? Number((painScore * weights.problemasOperacionais).toFixed(2))
        : null,
    status: hasPain ? 'inferido' : 'desconhecido',
    fonte: hasPain
      ? 'Oportunidades com evidência verificada'
      : 'Não verificado: requer validação em campo',
    consultado_em: hasPain ? new Date().toISOString() : null,
    justification: hasPain
      ? `${evidencedOpps.length} oportunidade(s) com evidência registrada.`
      : 'Não verificado: sem evidência empírica de dores operacionais.',
  });

  // 3. Capacidade de investimento
  const hasRevenue = hasEvidence(ctx.viability.averageCompanyRevenue);
  items.push({
    key: 'capacidadeInvestimento',
    name: 'Capacidade e disposição de investimento',
    weight: weights.capacidadeInvestimento,
    rawScore: hasRevenue ? 50 : null,
    weightedScore: hasRevenue
      ? Number((50 * weights.capacidadeInvestimento).toFixed(2))
      : null,
    status: hasRevenue ? ctx.viability.averageCompanyRevenue.status : 'desconhecido',
    fonte: ctx.viability.averageCompanyRevenue.fonte,
    consultado_em: ctx.viability.averageCompanyRevenue.consultado_em,
    justification: hasRevenue
      ? `Faturamento com fonte citada: ${ctx.viability.averageCompanyRevenue.valor}.`
      : 'Não verificado: sem fonte de faturamento médio do setor.',
  });

  // 4. Facilidade de prospecção
  const hasDecisor = hasEvidence(ctx.viability.accessibleDecisionMakers);
  let decisorScore: number | null = null;
  if (hasDecisor) {
    const v = ctx.viability.accessibleDecisionMakers.valor;
    decisorScore = v === 'direto' ? 90 : v === 'acessivel' ? 75 : v === 'moderado' ? 55 : 35;
  }
  items.push({
    key: 'facilidadeProspeccao',
    name: 'Facilidade de prospecção e acesso aos decisores',
    weight: weights.facilidadeProspeccao,
    rawScore: decisorScore,
    weightedScore:
      decisorScore !== null
        ? Number((decisorScore * weights.facilidadeProspeccao).toFixed(2))
        : null,
    status: hasDecisor ? ctx.viability.accessibleDecisionMakers.status : 'desconhecido',
    fonte: ctx.viability.accessibleDecisionMakers.fonte,
    consultado_em: ctx.viability.accessibleDecisionMakers.consultado_em,
    justification: hasDecisor
      ? `Classificação baseada em contatos verificados: ${ctx.viability.accessibleDecisionMakers.valor}.`
      : 'Não verificado: acessibilidade não mensurada em base real.',
  });

  // 5. Potencial de recorrência
  const hasRecurrence = hasEvidence(ctx.viability.reusabilityPotential);
  let recScore: number | null = null;
  if (hasRecurrence) {
    const v = ctx.viability.reusabilityPotential.valor;
    recScore = v === 'saas_escalavel' ? 90 : v === 'customizavel' ? 75 : 40;
  }
  items.push({
    key: 'potencialRecorrencia',
    name: 'Potencial de recorrência',
    weight: weights.potencialRecorrencia,
    rawScore: recScore,
    weightedScore:
      recScore !== null ? Number((recScore * weights.potencialRecorrencia).toFixed(2)) : null,
    status: hasRecurrence ? ctx.viability.reusabilityPotential.status : 'desconhecido',
    fonte: ctx.viability.reusabilityPotential.fonte,
    consultado_em: ctx.viability.reusabilityPotential.consultado_em,
    justification: hasRecurrence
      ? `Potencial classificado como ${ctx.viability.reusabilityPotential.valor}.`
      : 'Não verificado: sem dados de retenção/recorrência.',
  });

  // 6. Oportunidade competitiva
  const hasComp = hasEvidence(ctx.competition.marketSaturation);
  let compScore: number | null = null;
  if (hasComp) {
    const v = ctx.competition.marketSaturation.valor;
    compScore =
      v === 'subatendido' ? 90 : v === 'dominado_por_legados' ? 80 : v === 'moderado' ? 60 : 30;
  }
  items.push({
    key: 'oportunidadeCompetitiva',
    name: 'Oportunidade competitiva',
    weight: weights.oportunidadeCompetitiva,
    rawScore: compScore,
    weightedScore:
      compScore !== null ? Number((compScore * weights.oportunidadeCompetitiva).toFixed(2)) : null,
    status: hasComp ? ctx.competition.marketSaturation.status : 'desconhecido',
    fonte: ctx.competition.marketSaturation.fonte,
    consultado_em: ctx.competition.marketSaturation.consultado_em,
    justification: hasComp
      ? `Saturação com fonte: ${ctx.competition.marketSaturation.valor}.`
      : 'Não verificado: requer pesquisa manual de concorrentes.',
  });

  // 7. Viabilidade técnica
  const verifiedDaysOpps = ctx.opportunities.filter(
    (o) => !o.isAiHypothesis && hasEvidence(o.typicalDevelopmentDays)
  );
  const hasTech = verifiedDaysOpps.length > 0;
  let techScore: number | null = null;
  if (hasTech) {
    const avgDays =
      verifiedDaysOpps.reduce((acc, o) => acc + (o.typicalDevelopmentDays.valor || 0), 0) /
      verifiedDaysOpps.length;
    techScore = avgDays <= 15 ? 90 : avgDays <= 30 ? 75 : 50;
  }
  items.push({
    key: 'viabilidadeTecnica',
    name: 'Viabilidade técnica e operacional',
    weight: weights.viabilidadeTecnica,
    rawScore: techScore,
    weightedScore:
      techScore !== null ? Number((techScore * weights.viabilidadeTecnica).toFixed(2)) : null,
    status: hasTech ? 'inferido' : 'desconhecido',
    fonte: hasTech
      ? 'Estimativa técnica documentada'
      : 'Não verificado: escopo técnico ainda não validado',
    consultado_em: hasTech ? new Date().toISOString() : null,
    justification: hasTech
      ? 'Calculado a partir de estimativas documentadas.'
      : 'Não verificado: sem especificação validada.',
  });

  // 8. Qualidade das evidências
  const allEvidences: DataEvidence[] = [
    ...ctx.demand.evidences,
    ...ctx.paidTraffic.evidences,
    ...ctx.competition.evidences,
    ...ctx.viability.evidences,
  ];
  const verifiedEvCount = allEvidences.filter((e) => e.status === 'verificado').length;
  const evidencedCount = items.filter((i) => i.rawScore !== null).length;
  const totalCount = items.length;
  const confidenceFraction = Number((evidencedCount / totalCount).toFixed(2));

  const evidenceRaw = allEvidences.length > 0
    ? Math.round((verifiedEvCount / allEvidences.length) * 100)
    : null;

  items.push({
    key: 'qualidadeEvidencias',
    name: 'Qualidade das evidências',
    weight: weights.qualidadeEvidencias,
    rawScore: evidenceRaw,
    weightedScore:
      evidenceRaw !== null
        ? Number((evidenceRaw * weights.qualidadeEvidencias).toFixed(2))
        : null,
    status: evidenceRaw !== null ? 'inferido' : 'desconhecido',
    fonte:
      evidenceRaw !== null
        ? 'Cálculo determinístico sobre evidências coletadas'
        : 'Nenhuma evidência verificada registrada',
    consultado_em: new Date().toISOString(),
    justification: `${verifiedEvCount} de ${allEvidences.length} evidências verificadas; ${evidencedCount} de ${totalCount} critérios com dados.`,
  });

  // Score final ponderado apenas sobre critérios com dados reais
  const scoredItems = items.filter((i) => i.rawScore !== null);
  const scoredWeightSum = scoredItems.reduce((sum, i) => sum + i.weight, 0);
  const finalScore =
    scoredWeightSum > 0
      ? Math.round(
          scoredItems.reduce((sum, i) => sum + i.rawScore! * i.weight, 0) / scoredWeightSum
        )
      : null;

  let confidenceLevel: MetricConfidence = 'baixa';
  if (confidenceFraction >= 0.75) confidenceLevel = 'alta';
  else if (confidenceFraction >= 0.4) confidenceLevel = 'media';

  const now = new Date().toISOString();
  const commercialPotential =
    finalScore !== null
      ? inferido<'baixo' | 'moderado' | 'alto' | 'excepcional'>({
          valor:
            finalScore >= 80
              ? 'excepcional'
              : finalScore >= 70
              ? 'alto'
              : finalScore >= 50
              ? 'moderado'
              : 'baixo',
          fonte: 'Cálculo ponderado sobre critérios com evidência',
          regra: 'Faixas determinísticas sobre finalScore',
          consultado_em: now,
        })
      : desconhecido<'baixo' | 'moderado' | 'alto' | 'excepcional'>(
          'Critérios insuficientes para calcular potencial comercial',
          now
        );

  return {
    finalScore,
    confidenceLevel,
    confidenceFraction,
    evidencedCriteriaCount: evidencedCount,
    totalCriteriaCount: totalCount,
    commercialPotential,
    entryEase: desconhecido<'dificil' | 'moderada' | 'facil'>(
      'Requer evidência de decisores e concorrência',
      now
    ),
    executionRisk: desconhecido<'baixo' | 'moderado' | 'alto'>(
      'Requer validação técnica e regulatória',
      now
    ),
    items,
  };
}
