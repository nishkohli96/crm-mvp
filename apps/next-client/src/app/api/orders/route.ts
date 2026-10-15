import { sampleOrders } from '@/lib/api/sample-data';
import { mockJson } from '@/lib/mock-api/respond';

export function GET() {
  return mockJson(sampleOrders);
}
