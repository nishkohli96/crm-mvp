'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FoodImage } from '@/components/ui/FoodImage';
import { formatOrderDate, formatPrice } from '@/lib/format';
import type { Order } from '@/lib/api/types';

/** An order with its price and the two things you can do to it. State is local, there is no orders API to write to. */
export function OrderCard({ order }: { order: Order }) {
  const [cancelled, setCancelled] = useState(false);
  const [tracking, setTracking] = useState(false);

  return (
    <li className="flex gap-3 py-4">
      <Link
        href={`/food/${order.foodItemId}`}
        aria-label={`View ${order.name}`}
        className="relative block h-20 w-16 shrink-0 overflow-hidden rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <FoodImage src={order.image} alt="" sizes="64px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate text-base font-bold text-ink">
            {order.name}
          </h3>
          <p className="text-xs text-muted">
            {formatOrderDate(order.placedAt)}
          </p>
        </div>
        {cancelled
          ? (
            <p className="text-xs font-bold text-muted">Order cancelled</p>
          )
          : (
            <div>
              <div className="flex gap-2">
                <Button size="sm" pill onClick={() => setCancelled(true)}>
                  Cancel Order
                </Button>
                <Button size="sm" pill variant="soft" aria-pressed={tracking} onClick={() => setTracking(open => !open)}>
                  Track Driver
                </Button>
              </div>
              {tracking && (
                <p role="status" className="mt-1.5 text-xs text-muted">
                  Your driver is
                  {' '}
                  {order.driverEtaMinutes}
                  {' '}
                  min away.
                </p>
              )}
            </div>
          )}
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-extrabold text-brand-ink">
          {formatPrice(order.total)}
        </p>
        <p className="text-xs text-muted">
          {order.itemCount}
          {' '}
          {order.itemCount === 1 ? 'item' : 'items'}
        </p>
      </div>
    </li>
  );
}
