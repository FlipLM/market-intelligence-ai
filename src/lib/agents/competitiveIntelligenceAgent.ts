import type { CompetitiveAnalysis } from '@/types/market';
import { analyzeCompetitors } from '../connectors/competitors';

export function runCompetitiveIntelligenceAgent(): CompetitiveAnalysis {
  return analyzeCompetitors();
}
