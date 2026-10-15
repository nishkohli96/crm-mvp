import { sampleSendOtp } from '@/lib/api/sample-data';
import type { SendOtpBody } from '@/lib/api/types';
import { isValidPhone } from '@/lib/format';
import { mockError, mockJson, readJson } from '@/lib/mock-api/respond';

/* Mock "send OTP": validates the number and pretends to text a code */
export async function POST(request: Request) {
  const body = await readJson<SendOtpBody>(request);
  if (!body?.phone || !isValidPhone(body.phone)) {
    return mockError(400, 'Enter a valid 10-digit mobile number');
  }
  return mockJson(sampleSendOtp);
}
