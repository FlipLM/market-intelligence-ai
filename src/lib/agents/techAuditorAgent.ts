import type { TechAuditAnalysis } from '@/types/market';
import { desconhecido } from '@/types/provenance';

export function runTechAuditorAgent(): TechAuditAnalysis {
  const fonte = 'Não verificado: requer levantamento técnico real';
  return {
    isAiHypothesis: true,
    disclaimer:
      'Referência técnica opcional (hipótese de arquitetura; não constitui medição real de ROI ou reuso).',
    verdict: desconhecido(fonte),
    verdictTitle: desconhecido(fonte),
    verdictReason: desconhecido(fonte),
    architectureComplexity: desconhecido(fonte),
    recommendedTechStack: desconhecido(fonte),
    pitfallsToAvoid: desconhecido(fonte),
  };
}
