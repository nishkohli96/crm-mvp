'use client';

import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@base-ui/react/button';
import { SpinnerIcon } from '@/components/icons';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'soft' | 'icon';
type Size = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<BaseButtonProps, 'className'> & {
  /** `primary` solid orange, `soft` peach, `icon` for a bare icon (give it a size via className) */
  variant?: Variant;
  /** Height and text size, ignored by `icon` */
  size?: Size;
  /** Fully rounded ends instead of a rounded rectangle */
  pill?: boolean;
  fullWidth?: boolean;
  /** Shows a spinner and blocks clicks, the label stays so the width does not jump */
  loading?: boolean;
  /** Layout and extra colours, eg. `w-24` or a background for an icon button */
  className?: string;
};

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:not-data-disabled:bg-brand-dark active:not-data-disabled:bg-brand-dark',
  soft: 'bg-brand-soft text-brand-ink hover:not-data-disabled:bg-brand-soft-hover',
  icon: 'text-brand-ink'
};

const sizes: Record<Size, string> = {
  sm: 'h-7 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base'
};

/**
 * The one button used on every screen. Built on Base UI's Button, so it
 * keeps its disabled and focus behaviour; `render` swaps the element, eg.
 * `render={<Link href="/" />}` makes a link that looks like a button.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  pill = false,
  fullWidth = false,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      {...props}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 font-bold whitespace-nowrap select-none',
        'transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2',
        'data-disabled:cursor-not-allowed data-disabled:opacity-50',
        variants[variant],
        variant !== 'icon' && sizes[size],
        variant !== 'icon' && (pill ? 'rounded-full' : 'rounded-lg'),
        fullWidth && 'w-full',
        className
      )}
    >
      {loading && <SpinnerIcon width={16} height={16} />}
      {children}
    </BaseButton>
  );
}
