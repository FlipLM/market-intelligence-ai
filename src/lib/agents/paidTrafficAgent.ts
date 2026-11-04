import { PaidTrafficAnalysis } from '@/types/market';
import { analyzePaidTraffic } from '../connectors/googleAds';

export function runPaidTrafficAgent(nicheName: string): PaidTrafficAnalysis {
  return analyzePaidTraffic(nicheName);
}

