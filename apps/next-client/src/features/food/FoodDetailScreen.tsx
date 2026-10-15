'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { CheckIcon } from '@/components/icons';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { FoodImage } from '@/components/ui/FoodImage';
import { PortionPicker } from '@/components/ui/PortionPicker';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { Screen } from '@/components/ui/Screen';
import { getFoodItem } from '@/lib/api/endpoints';
import type { FoodItem } from '@/lib/api/types';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import useApiData from '@/hooks/useApiData';
import { useRequireSession } from '@/lib/session';

function FoodDetails({ item }: { item: FoodItem }) {
  const [quantity, setQuantity] = useState(1);
  const [portionId, setPortionId] = useState(item.portions[0].id);
  const [added, setAdded] = useState(false);

  const portion = item.portions.find(option => option.id === portionId) ?? item.portions[0];
  const unitPrice = item.price + portion.extraPrice;

  function handleAdd() {
    addToCart({ foodItemId: item.id, name: item.name, portionId, quantity, unitPrice });
    setAdded(true);
  }

  return (
    <>
      <div className="flex-1 px-4 pt-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <FoodImage src={item.image} alt={item.name} sizes="(max-width: 430px) 100vw, 430px" priority />
          <BackButton className="absolute top-3 left-3 bg-white/90 shadow-sm" />
        </div>

        <div className="mt-4 flex items-center justify-between border-b border-line pb-3">
          <p className="text-xl font-extrabold text-brand-ink tabular-nums">
            {formatPrice(unitPrice)}
          </p>
          <QuantityStepper value={quantity} onValueChange={setQuantity} />
        </div>

        <div className="py-4">
          <p className="text-xs text-muted">
            {item.restaurantName}
          </p>
          <h1 className="mt-1 text-base font-extrabold text-ink">
            {item.name}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        </div>

        <PortionPicker
          title="Portion size"
          options={item.portions}
          value={portionId}
          onValueChange={id => {
            setPortionId(id);
            setAdded(false);
          }}
        />
      </div>

      <div className="sticky bottom-0 bg-white px-4 pt-3 pb-6">
        <Button size="lg" fullWidth onClick={handleAdd}>
          {added
            ? (
              <>
                <CheckIcon width={18} height={18} />
                {' '}
                Added to cart
              </>
            )
            : (
              `Add to cart · ${formatPrice(unitPrice * quantity)}`
            )}
        </Button>
        <p role="status" className="sr-only">
          {added ? `${quantity} × ${item.name} added to your cart` : ''}
        </p>
      </div>
    </>
  );
}

export function FoodDetailScreen({ id }: { id: string }) {
  const session = useRequireSession();
  const load = useCallback(() => getFoodItem(id), [id]);
  const food = useApiData(load);

  if (!session) {
    return <Screen />;
  }

  return (
    <Screen>
      {food.status === 'ready' && <FoodDetails item={food.data} />}
      {food.status === 'loading' && (
        <div aria-hidden className="m-4 aspect-[4/3] animate-pulse rounded-3xl bg-field motion-reduce:animate-none" />
      )}
      {food.status === 'error' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-xl font-extrabold text-ink">
            {food.notFound ? 'We could not find this dish' : 'This dish did not load'}
          </h1>
          <p className="text-sm text-muted">
            {food.notFound ? 'It may have been removed from the menu.' : food.message}
          </p>
          <Button nativeButton={false} render={<Link href="/" />}>
            Back to home
          </Button>
        </div>
      )}
    </Screen>
  );
}
