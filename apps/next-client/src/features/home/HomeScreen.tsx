'use client';

import { Button } from '@/components/ui/Button';
import { PhoneIcon, WalletIcon } from '@/components/icons';
import { Screen } from '@/components/ui/Screen';
import { getOrders, getRestaurants } from '@/lib/api/endpoints';
import { useApiData } from '@/lib/hooks';
import { useRequireSession } from '@/lib/session';
import { BestSellerTile } from './BestSellerTile';
import { OrderCard } from './OrderCard';
import { PromoCarousel } from './PromoCarousel';

export function HomeScreen() {
  const session = useRequireSession();
  const restaurants = useApiData(getRestaurants);
  const orders = useApiData(getOrders);

  if (!session) {
    return <Screen />;
  }

  const usingSampleData
    = (restaurants.status === 'ready' && restaurants.source === 'fallback')
      || (orders.status === 'ready' && orders.source === 'fallback');

  return (
    <Screen className="px-5 pb-10 pt-5">
      <header>
        <p className="text-[11px] text-muted">Current Location</p>
        <p className="text-sm font-bold text-ink">
          {restaurants.status === 'ready' ? restaurants.data.location : 'Finding restaurants near you'}
        </p>
      </header>

      <div className="mt-4 flex items-center gap-3">
        <p className="flex h-11 flex-1 items-center truncate rounded-xl bg-field px-4 text-sm text-muted">
          {session.user.name}
        </p>
        <Button
          variant="icon"
          aria-label="Call support"
          className="size-11 rounded-xl bg-gradient-to-br from-orange-400 to-brand text-white"
        >
          <PhoneIcon width={20} height={20} />
        </Button>
        <Button
          variant="icon"
          aria-label="Open wallet"
          className="size-11 rounded-xl bg-gradient-to-br from-sky-300 to-blue-500 text-white"
        >
          <WalletIcon width={20} height={20} />
        </Button>
      </div>

      {usingSampleData && (
        <p role="status" className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          The restaurant service is not responding, so you are seeing sample restaurants and orders.
        </p>
      )}

      <section className="mt-6" aria-labelledby="best-seller">
        <h2 id="best-seller" className="text-base font-extrabold text-ink">Best Seller</h2>
        <div className="-mx-5 mt-3 overflow-x-auto px-5 no-scrollbar">
          <ul className="flex gap-3">
            {restaurants.status === 'ready'
              ? restaurants.data.restaurants.map(restaurant => (
                <li key={restaurant.id}>
                  <BestSellerTile restaurant={restaurant} />
                </li>
              ))
              : Array.from({ length: 4 }, (_, index) => (
                <li key={index} aria-hidden className="h-[120px] w-[84px] shrink-0 animate-pulse rounded-2xl bg-field motion-reduce:animate-none" />
              ))}
          </ul>
        </div>
        {restaurants.status === 'error' && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {restaurants.message}
          </p>
        )}
      </section>

      <div className="mt-6">
        {restaurants.status === 'ready'
          ? (
            <PromoCarousel promotions={restaurants.data.promotions} />
          )
          : (
            <div aria-hidden className="h-36 animate-pulse rounded-2xl bg-field motion-reduce:animate-none" />
          )}
      </div>

      <section className="mt-6" aria-labelledby="popular-items">
        <h2 id="popular-items" className="text-base font-extrabold text-ink">Popular Items</h2>
        {orders.status === 'ready' && (
          <ul className="divide-y divide-line">
            {orders.data.orders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
        {orders.status === 'error' && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {orders.message}
          </p>
        )}
        {orders.status === 'loading' && (
          <div aria-hidden className="mt-3 h-24 animate-pulse rounded-2xl bg-field motion-reduce:animate-none" />
        )}
      </section>
    </Screen>
  );
}
