import type { CompetitiveAnalysis } from '@/types/market';
import { desconhecido } from '@/types/provenance';

export function analyzeCompetitors(): CompetitiveAnalysis {
  const fonte = 'Não verificado: requer pesquisa manual de concorrentes';
  return {
    marketSaturation: desconhecido(fonte),
    mainCompetitors: desconhecido(fonte),
    entryBarriers: desconhecido(fonte),
    differentiationAngle: desconhecido(fonte),
    opportunityType: desconhecido(fonte),
    evidences: [],
  };
}
