'use client';

import { useId } from 'react';
import { Radio } from '@base-ui/react/radio';
import { RadioGroup } from '@base-ui/react/radio-group';
import { formatPrice } from '@/lib/format';

export type PortionOption = { id: string; label: string; extraPrice: number };

type PortionPickerProps = {
  title: string;
  options: PortionOption[];
  value: string;
  onValueChange: (id: string) => void;
};

/** Radio list: option name, a dotted line, the extra price, then the radio. */
export function PortionPicker({ title, options, value, onValueChange }: PortionPickerProps) {
  const titleId = useId();
  return (
    <section>
      <h2 id={titleId} className="text-base font-bold text-ink">
        {title}
      </h2>
      <RadioGroup
        aria-labelledby={titleId}
        value={value}
        onValueChange={next => onValueChange(String(next))}
        className="mt-3 flex flex-col gap-1"
      >
        {options.map(option => (
          <label
            key={option.id}
            className="flex cursor-pointer items-center gap-3 py-2 text-sm text-ink"
          >
            <span>
              {option.label}
            </span>
            <span aria-hidden className="flex-1 border-b border-dotted border-muted/50" />
            <span className="text-muted tabular-nums">
              {option.extraPrice === 0 ? 'Included' : `+${formatPrice(option.extraPrice)}`}
            </span>
            <Radio.Root
              value={option.id}
              className="flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-brand bg-white outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <Radio.Indicator className="size-2.5 rounded-full bg-brand data-unchecked:hidden" />
            </Radio.Root>
          </label>
        ))}
      </RadioGroup>
    </section>
  );
}
