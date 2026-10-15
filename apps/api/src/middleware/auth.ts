import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '@/utils/errors';
import { verifyToken } from '@/utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string };
  }
}

/* Expects "Authorization: Bearer <token>" and sets `req.user` from it. */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new HttpError(401, 'Missing or malformed Authorization header');
  }
  req.user = { id: verifyToken(token) };
  next();
}

/* The logged-in employee's id. Always read it from here, never from the request body/params. */
export function getUserId(req: Request) {
  if (!req.user) {
    throw new HttpError(401, 'Unauthorized');
  }
  return req.user.id;
}
