import jwt, { type SignOptions } from 'jsonwebtoken';
import { ENV_VARS } from '@/constants';
import { HttpError } from './errors';

const jwtAlgorithm = 'HS256';

const { jwtSecret: secret, jwtExpiresIn } = ENV_VARS;

if (!secret) {
  throw new Error('JWT_SECRET is not set, see .env_sample');
}

/* Narrowed to string, a const destructured above would lose that inside the functions */
const jwtSecret = secret;

export function signToken(employeeId: string) {
  return jwt.sign({}, jwtSecret, {
    algorithm: jwtAlgorithm,
    subject: employeeId,
    expiresIn: jwtExpiresIn as SignOptions['expiresIn']
  });
}

/* Returns the employee id the token was issued for. */
export function verifyToken(token: string) {
  try {
    const payload = jwt.verify(token, jwtSecret, { algorithms: [jwtAlgorithm] });
    if (typeof payload !== 'string' && payload.sub) {
      return payload.sub;
    }
  } catch {
    /* expired, malformed or wrong signature, all answered with the same 401 */
  }
  throw new HttpError(401, 'Invalid or expired token');
}
