import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Phone-width column, centred with a soft edge on wider screens. */
export function Screen({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        'mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-white md:shadow-xl',
        className
      )}
    >
      {children}
    </main>
  );
}
