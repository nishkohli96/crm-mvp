'use client';

import { useRef, useState } from 'react';
import { FoodImage } from '@/components/ui/FoodImage';
import { cn } from '@/lib/cn';
import type { Promotion } from '@/lib/api/types';

/** Swipeable promo banners with a dot for each one. */
export function PromoCarousel({ promotions }: { promotions: Promotion[] }) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  return (
    <section aria-label="Offers">
      <ul
        ref={trackRef}
        onScroll={() => {
          const track = trackRef.current;
          if (track) {
            setActive(Math.round(track.scrollLeft / track.clientWidth));
          }
        }}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
      >
        {promotions.map((promo, index) => (
          <li
            key={promo.id}
            aria-label={`Offer ${index + 1} of ${promotions.length}`}
            className="relative flex h-36 w-full shrink-0 snap-center overflow-hidden bg-brand"
          >
            <div className="relative z-10 flex w-[46%] flex-col justify-center gap-1 pl-5 text-white">
              <p className="text-xs leading-snug font-semibold">
                {promo.title}
              </p>
              <p className="text-2xl leading-tight font-extrabold">
                {promo.headline}
              </p>
            </div>
            <div className="absolute inset-y-0 right-0 w-[54%] overflow-hidden rounded-l-[2.75rem]">
              <FoodImage src={promo.image} alt="" sizes="240px" priority={index === 0} />
            </div>
            <span
              aria-hidden
              className="absolute -top-3 left-[45%] size-9 rounded-full border-4 border-amber-300/80"
            />
          </li>
        ))}
      </ul>
      {promotions.length > 1 && (
        <div aria-hidden className="mt-2 flex justify-center gap-1.5">
          {promotions.map((promo, index) => (
            <span
              key={promo.id}
              className={cn(
                'h-1 rounded-full transition-all',
                index === active ? 'w-5 bg-brand' : 'w-3 bg-brand-soft'
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
