'use client';

import { useState } from 'react';
import Image from 'next/image';

type FoodImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/**
 * Fills its (relatively positioned) parent. If the photo fails to load the
 * parent shows a plain tile instead of a broken image icon.
 */
export function FoodImage({ src, alt, sizes, priority, className }: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div role="img" aria-label={alt} className="flex size-full items-center justify-center bg-brand-soft text-2xl">
        <span aria-hidden>🍽️</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
      className={`object-cover ${className ?? ''}`}
    />
  );
}
