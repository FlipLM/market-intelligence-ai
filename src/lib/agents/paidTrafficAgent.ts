import { PaidTrafficAnalysis } from '@/types/market';
import { analyzePaidTraffic } from '../connectors/googleAds';

export function runPaidTrafficAgent(): PaidTrafficAnalysis {
  return analyzePaidTraffic();
}
