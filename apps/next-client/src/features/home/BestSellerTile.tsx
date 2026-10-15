import Link from 'next/link';
import { FoodImage } from '@/components/ui/FoodImage';
import { formatPrice } from '@/lib/format';
import type { Restaurant } from '@/lib/api/types';

/** Photo tile with the starting price in the corner, opens the restaurant's signature dish. */
export function BestSellerTile({ restaurant }: { restaurant: Restaurant }) {
  const { startingPrice } = restaurant;
  const label = [restaurant.name, restaurant.cuisine, startingPrice !== undefined && `from ${formatPrice(startingPrice, true)}`]
    .filter(Boolean)
    .join(', ');
  return (
    <Link
      href={`/food/${restaurant.featuredFoodId}`}
      aria-label={label}
      className="relative block h-[120px] w-[84px] shrink-0 overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <FoodImage src={restaurant.image} alt="" sizes="84px" />
      {startingPrice !== undefined && (
        <span className="absolute right-0 bottom-2 rounded-l-md bg-brand px-1.5 py-0.5 text-[11px] font-bold text-white">
          {formatPrice(startingPrice, true)}
        </span>
      )}
    </Link>
  );
}
