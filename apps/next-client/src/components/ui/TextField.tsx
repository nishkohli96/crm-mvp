'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Field } from '@base-ui/react/field';
import { cn } from '@/lib/cn';

type TextFieldProps = Omit<ComponentProps<typeof Field.Control>, 'className' | 'prefix'> & {
  label: string;
  /** Text shown before the input, eg. a dial code */
  prefix?: ReactNode;
  /** Error message, also puts the field in its invalid style */
  error?: string;
  /** Visually hide the label, it still names the input for screen readers */
  hideLabel?: boolean;
};

/** Labelled text input on a grey rounded field, with an optional prefix and error line. */
export function TextField({ label, prefix, error, hideLabel, ...inputProps }: TextFieldProps) {
  return (
    <Field.Root invalid={!!error} className="flex flex-col gap-2">
      <Field.Label className={cn('text-sm font-bold text-ink', hideLabel && 'sr-only')}>
        {label}
      </Field.Label>
      <div
        className={cn(
          'flex h-12 items-center rounded-lg border bg-field px-4 transition-colors',
          'focus-within:border-brand focus-within:ring-1 focus-within:ring-brand',
          error ? 'border-red-600' : 'border-line'
        )}
      >
        {prefix && (
          <>
            <span className="text-sm font-bold text-ink">
              {prefix}
            </span>
            <span aria-hidden className="mx-3 h-5 w-px bg-line" />
          </>
        )}
        <Field.Control
          {...inputProps}
          className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
      </div>
      <Field.Error match={!!error} className="text-sm text-red-700">
        {error}
      </Field.Error>
    </Field.Root>
  );
}
