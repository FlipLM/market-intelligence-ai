import { CompetitiveAnalysis } from '@/types/market';
import { analyzeCompetitors } from '../connectors/competitors';

export function runCompetitiveIntelligenceAgent(nicheName: string): CompetitiveAnalysis {
  return analyzeCompetitors(nicheName);
}

