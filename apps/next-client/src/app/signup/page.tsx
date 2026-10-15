import type { Metadata } from 'next';
import { SignupScreen } from '@/features/auth/SignupScreen';

export const metadata: Metadata = { title: 'Sign up' };

export default function SignupPage() {
  return <SignupScreen />;
}
