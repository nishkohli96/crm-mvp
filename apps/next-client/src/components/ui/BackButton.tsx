'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@/components/icons';
import { Button } from './Button';

/** Round arrow that goes back one step, or to `fallbackHref` when there is no history. */
export function BackButton({ fallbackHref = '/', className }: { fallbackHref?: string; className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="icon"
      aria-label="Go back"
      className={`size-10 rounded-full ${className ?? ''}`}
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
    >
      <ArrowLeftIcon width={22} height={22} />
    </Button>
  );
}
