import { MOCK_OTP, sampleLogin } from '@/lib/api/sample-data';
import type { VerifyOtpBody } from '@/lib/api/types';
import { isValidPhone } from '@/lib/format';
import { mockError, mockJson, readJson } from '@/lib/mock-api/respond';

/* Mock "verify OTP": the only code that works is MOCK_OTP */
export async function POST(request: Request) {
  const body = await readJson<VerifyOtpBody>(request);
  if (!body?.phone || !isValidPhone(body.phone)) {
    return mockError(400, 'Enter a valid 10-digit mobile number');
  }
  if (body.otp !== MOCK_OTP) {
    return mockError(401, 'That code is incorrect. Check it and try again.');
  }
  return mockJson(sampleLogin(body.phone));
}
