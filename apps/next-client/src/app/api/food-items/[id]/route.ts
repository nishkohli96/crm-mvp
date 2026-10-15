import { findFoodItem } from '@/lib/api/sample-data';
import { mockError, mockJson } from '@/lib/mock-api/respond';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = findFoodItem(id);
  return item ? mockJson(item) : mockError(404, 'We could not find this dish');
}
