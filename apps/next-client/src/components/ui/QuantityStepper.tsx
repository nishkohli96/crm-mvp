'use client';

import { NumberField } from '@base-ui/react/number-field';
import { MinusIcon, PlusIcon } from '@/components/icons';

type QuantityStepperProps = {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
};

const stepClass
  = 'flex size-6 items-center justify-center rounded-full bg-brand text-white outline-none transition-colors '
    + 'hover:not-data-disabled:bg-brand-dark focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 '
    + 'data-disabled:opacity-40';

/** Round minus and plus buttons around the number, the number can also be typed. */
export function QuantityStepper({
  value,
  onValueChange,
  min = 1,
  max = 20,
  label = 'Quantity'
}: QuantityStepperProps) {
  return (
    <NumberField.Root
      value={value}
      min={min}
      max={max}
      step={1}
      onValueChange={next => onValueChange(next ?? min)}
    >
      <NumberField.Group className="flex items-center gap-2">
        <NumberField.Decrement className={stepClass} aria-label="Decrease quantity">
          <MinusIcon width={14} height={14} strokeWidth={3} />
        </NumberField.Decrement>
        <NumberField.Input
          aria-label={label}
          className="w-7 bg-transparent text-center text-base font-bold text-ink tabular-nums outline-none"
        />
        <NumberField.Increment className={stepClass} aria-label="Increase quantity">
          <PlusIcon width={14} height={14} strokeWidth={3} />
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
