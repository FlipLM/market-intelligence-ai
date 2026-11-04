import { DemandAnalysis } from '@/types/market';
import { analyzeSearchTrends } from '../connectors/trends';

export function runDemandIntelligenceAgent(nicheName: string): DemandAnalysis {
  return analyzeSearchTrends(nicheName);
}

