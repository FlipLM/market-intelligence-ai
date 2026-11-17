import { DemandAnalysis } from '@/types/market';
import { analyzeSearchTrends } from '../connectors/trends';

export function runDemandIntelligenceAgent(): DemandAnalysis {
  return analyzeSearchTrends();
}
