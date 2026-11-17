import { DemandAnalysis } from '@/types/market';
import { desconhecido } from '@/types/provenance';

export function analyzeSearchTrends(): DemandAnalysis {
  const fonte = 'Não verificado: requer pesquisa manual em fonte oficial/pública';
  return {
    overallDemandScore: desconhecido(fonte),
    serviceSearchVolume: desconhecido(fonte),
    softwareSearchVolume: desconhecido(fonte),
    ratioExplanation: desconhecido(fonte),
    trendingQueries: desconhecido(fonte),
    operationalPainMentions: desconhecido(fonte),
    digitalizationNeedLevel: desconhecido(fonte),
    seasonality: desconhecido(fonte),
    evidences: [],
  };
}
