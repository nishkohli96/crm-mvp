'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { sendOtp } from '@/lib/api/endpoints';
import { isValidPhone } from '@/lib/format';
import { useRedirectIfSignedIn } from '@/lib/session';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';

const DIAL_CODE = '+91';

export function SignupScreen() {
  const router = useRouter();
  const canShow = useRedirectIfSignedIn();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!canShow) {
    return <Screen />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidPhone(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOtp({ phone, dialCode: DIAL_CODE });
      router.push(`/verify?phone=${phone}`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'We could not send the code. Try again.');
      setLoading(false);
    }
  }

  return (
    <Screen className="px-6 pb-8 pt-6">
      <BackButton className="-ml-2 self-start" />
      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-1 flex-col">
        <h1 className="text-2xl font-extrabold text-ink">Sign Up to Foodie</h1>
        <p className="mt-2 text-sm text-muted">
          Let us know your mobile number and we will send you an OTP for verification.
        </p>

        <div className="mt-10">
          <TextField
            label="Mobile number"
            hideLabel
            prefix={DIAL_CODE}
            type="tel"
            name="phone"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="00000 00000"
            value={phone}
            error={error}
            onChange={event => {
              setPhone(event.target.value.replace(/\D/g, '').slice(0, 10));
              setError('');
            }}
          />
        </div>

        <div className="mt-auto pt-10">
          <Button type="submit" size="lg" fullWidth loading={loading}>
            Get OTP
          </Button>
          <p className="mt-4 text-center text-xs text-balance text-muted">
            By clicking, I accept the
            {' '}
            <strong className="text-ink">Terms &amp; Conditions</strong>
            {' '}
            and
            {' '}
            <strong className="text-ink">Privacy Policy</strong>
          </p>
        </div>
      </form>
    </Screen>
  );
}
