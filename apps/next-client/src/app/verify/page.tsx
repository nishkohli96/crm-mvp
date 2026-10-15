import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { VerifyScreen } from '@/features/auth/VerifyScreen';
import { isValidPhone } from '@/lib/format';

export const metadata: Metadata = { title: 'Verify your number' };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ phone?: string | string[] }> }) {
  const { phone } = await searchParams;
  if (typeof phone !== 'string' || !isValidPhone(phone)) {
    redirect('/signup');
  }
  return <VerifyScreen phone={phone} />;
}
