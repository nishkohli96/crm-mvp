'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError } from '@/lib/api/client';
import { sendOtp, verifyOtp } from '@/lib/api/endpoints';
import { MOCK_OTP } from '@/lib/api/sample-data';
import { formatCountdown, formatPhone } from '@/lib/format';
import useCountdown from '@/hooks/useCountdown';
import { saveSession, useRedirectIfSignedIn } from '@/lib/session';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { Screen } from '@/components/ui/Screen';

const DIAL_CODE = '+91';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function VerifyScreen({ phone }: { phone: string }) {
  const router = useRouter();
  const canShow = useRedirectIfSignedIn();
  const messageId = useId();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { remaining, restart } = useCountdown(RESEND_SECONDS);

  if (!canShow) {
    return <Screen />;
  }

  async function verify(otp: string) {
    if (otp.length !== OTP_LENGTH || loading) {
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await verifyOtp({ phone, dialCode: DIAL_CODE, otp });
      saveSession(data);
      router.replace('/');
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'We could not verify the code. Try again.');
      setLoading(false);
    }
  }

  async function resend() {
    setError('');
    setCode('');
    restart();
    try {
      await sendOtp({ phone, dialCode: DIAL_CODE });
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'We could not send a new code. Try again.');
    }
  }

  return (
    <Screen className="px-6 pb-8 pt-6">
      <BackButton fallbackHref="/signup" className="-ml-2 self-start" />
      <div className="mt-6 flex flex-1 flex-col">
        <h1 className="text-2xl font-extrabold text-ink">6-digit code</h1>
        <p className="mt-2 text-sm text-muted">
          Please enter the code we have sent to
          <strong className="mt-1 block text-ink">
            {DIAL_CODE}
            {' '}
            {formatPhone(phone)}
          </strong>
        </p>

        <div className="mt-8">
          <OtpInput
            id="otp"
            label="6-digit verification code"
            length={OTP_LENGTH}
            separatorAfter={3}
            value={code}
            onValueChange={next => {
              setCode(next);
              setError('');
            }}
            onComplete={verify}
            invalid={!!error}
            disabled={loading}
            describedBy={messageId}
          />
          <div id={messageId} className="mt-3 text-sm" aria-live="polite">
            {error && (
              <p className="text-red-700">
                {error}
              </p>
            )}
          </div>
        </div>

        <p className="mt-2 text-sm text-ink">
          I didn&apos;t receive a code
          {' '}
          {remaining > 0
            ? (
              <span className="font-bold text-brand-ink tabular-nums">
                (
                {formatCountdown(remaining)}
                )
              </span>
            )
            : (
              <>
                <button
                  type="button"
                  onClick={resend}
                  className="font-bold text-brand-ink underline underline-offset-2"
                >
                  Resend code
                </button>
              </>
            )}
        </p>
        {process.env.NODE_ENV !== 'production' && (
          <p className="mt-3 text-xs text-muted">
            {`Demo build: the code is ${MOCK_OTP}.`}
          </p>
        )}

        <div className="mt-auto pt-10">
          <Button
            size="lg"
            fullWidth
            loading={loading}
            disabled={code.length !== OTP_LENGTH}
            onClick={() => verify(code)}
          >
            Continue
          </Button>
        </div>
      </div>
    </Screen>
  );
}
