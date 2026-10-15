import type { Metadata } from 'next';
import { FoodDetailScreen } from '@/features/food/FoodDetailScreen';

export const metadata: Metadata = { title: 'Dish details' };

export default async function FoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <FoodDetailScreen id={id} />;
}
