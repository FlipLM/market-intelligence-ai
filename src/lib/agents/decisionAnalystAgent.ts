import type {
  NicheBasicInfo,
  CommercialViability,
  NicheScoreBreakdown,
  NicheReport,
} from '@/types/market';
import { type ProvenanceField, inferido, desconhecido } from '@/types/provenance';

export function runDecisionAnalystAgent(params: {
  basicInfo: NicheBasicInfo;
  viability: CommercialViability;
  scoring: NicheScoreBreakdown;
}): {
  whyEnterArguments: ProvenanceField<string[]>;
  whyNotEnterRisks: ProvenanceField<string[]>;
  decisionRecommendation: ProvenanceField<string>;
  recommendedAction: NicheReport['recommendedAction'];
  dataSufficiency: NicheReport['dataSufficiency'];
} {
  const { scoring } = params;
  const now = new Date().toISOString();

  let dataSufficiency: NicheReport['dataSufficiency'] = 'insuficiente';
  if (scoring.confidenceFraction >= 0.75) dataSufficiency = 'completa';
  else if (scoring.confidenceFraction >= 0.35) dataSufficiency = 'parcial';

  let recommendedAction: NicheReport['recommendedAction'] = 'pesquisa_manual_necessaria';
  if (dataSufficiency !== 'insuficiente' && scoring.finalScore !== null) {
    if (scoring.finalScore >= 78) recommendedAction = 'avancar_imediatamente';
    else if (scoring.finalScore >= 60) recommendedAction = 'testar_com_piloto';
    else recommendedAction = 'monitorar';
  }

  return {
    whyEnterArguments: desconhecido<string[]>(
      'Sem evidências suficientes para listar argumentos verificados',
      now
    ),
    whyNotEnterRisks: desconhecido<string[]>(
      'Sem evidências suficientes para listar riscos verificados',
      now
    ),
    decisionRecommendation: inferido({
      valor: `Foram encontrados ${scoring.evidencedCriteriaCount} de ${scoring.totalCriteriaCount} critérios com evidência verificável (confiança ${scoring.confidenceLevel}). Pesquisa manual e entrevistas comerciais são necessárias antes de investir neste nicho.`,
      fonte: 'Regra determinística sobre fração de critérios com evidência',
      regra: 'dataSufficiency derivada de scoring.confidenceFraction',
      consultado_em: now,
    }),
    recommendedAction,
    dataSufficiency,
  };
}
