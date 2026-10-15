'use client';

import { Fragment } from 'react';
import { OTPField } from '@base-ui/react/otp-field';
import { cn } from '@/lib/cn';

type OtpInputProps = {
  /** Id of the first box, the label points at it */
  id: string;
  /** Names the whole code for screen readers, not shown */
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Called once every box is filled, also when a full code is pasted */
  onComplete?: (value: string) => void;
  length?: number;
  /** Show a dot after this many boxes, eg. 3 for 123 · 456 */
  separatorAfter?: number;
  invalid?: boolean;
  disabled?: boolean;
  /** Id of the element with the hint or error text */
  describedBy?: string;
};

/**
 * One-time-code input: one box per digit, typing moves to the next box,
 * backspace goes back and a pasted code fills every box. Digits only.
 */
export function OtpInput({
  id,
  label,
  value,
  onValueChange,
  onComplete,
  length = 6,
  separatorAfter,
  invalid,
  disabled,
  describedBy
}: OtpInputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <OTPField.Root
        id={id}
        length={length}
        value={value}
        onValueChange={onValueChange}
        onValueComplete={onComplete}
        disabled={disabled}
        aria-describedby={describedBy}
        className="flex items-center gap-2"
      >
        {Array.from({ length }, (_, index) => (
          <Fragment key={index}>
            <OTPField.Input
              aria-label={index === 0 ? undefined : `Digit ${index + 1} of ${length}`}
              aria-invalid={invalid || undefined}
              className={cn(
                'h-12 w-10 rounded-lg border bg-white text-center text-lg font-bold text-ink outline-none transition-colors',
                'focus:border-brand focus:ring-1 focus:ring-brand disabled:opacity-50',
                invalid ? 'border-red-600' : 'border-line'
              )}
            />
            {separatorAfter === index + 1 && index + 1 < length && (
              <OTPField.Separator className="px-1 text-lg font-bold text-muted">·</OTPField.Separator>
            )}
          </Fragment>
        ))}
      </OTPField.Root>
    </div>
  );
}
