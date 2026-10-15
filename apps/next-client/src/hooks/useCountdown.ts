'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Counts down once per second from `seconds`.
 * `restart` begins again.
 */
export default function useCountdown(seconds: number) {
  const [endsAt, setEndsAt] = useState(() => Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    const tick = () => setRemaining(
      Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
    );
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [endsAt]);

  const restart = useCallback(() => {
    setEndsAt(Date.now() + seconds * 1000);
    setRemaining(seconds);
  }, [seconds]);

  return { remaining, restart };
}
