import type { PaidTrafficAnalysis } from '@/types/market';
import { desconhecido } from '@/types/provenance';

export function analyzePaidTraffic(): PaidTrafficAnalysis {
  const fonte = 'Não verificado: requer pesquisa manual no Google Ads / Meta Ad Library';
  return {
    hasPaidAdsIdentified: desconhecido(fonte),
    advertiserCount: desconhecido(fonte),
    averageCpc: desconhecido(fonte),
    cpcRange: desconhecido(fonte),
    auctionCompetition: desconhecido(fonte),
    observedKeywords: desconhecido(fonte),
    acquisitionDifficulty: desconhecido(fonte),
    evidences: [],
  };
}
