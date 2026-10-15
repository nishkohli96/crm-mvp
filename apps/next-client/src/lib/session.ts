'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/api/types';

export type Session = { token: string; user: User };

const STORAGE_KEY = 'app.session';
const listeners = new Set<() => void>();

function readStorage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage blocked: the session only lives until the next reload */
  }
  listeners.forEach(notify => notify());
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing to clear */
  }
  listeners.forEach(notify => notify());
}

const noopSubscribe = () => () => undefined;

/** `ready` is false on the server and during hydration, when storage cannot be read yet. */
export function useSession() {
  const raw = useSyncExternalStore(subscribe, readStorage, () => null);
  const ready = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const session = useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as Session) : null;
    } catch {
      return null;
    }
  }, [raw]);
  return { session, ready };
}

/** Sends visitors without a session to the signup screen. */
export function useRequireSession() {
  const router = useRouter();
  const { session, ready } = useSession();
  useEffect(() => {
    if (ready && !session) {
      router.replace('/signup');
    }
  }, [ready, session, router]);
  return session;
}

/** Sends signed-in users away from the signup screens. */
export function useRedirectIfSignedIn() {
  const router = useRouter();
  const { session, ready } = useSession();
  useEffect(() => {
    if (ready && session) {
      router.replace('/');
    }
  }, [ready, session, router]);
  return ready && !session;
}
