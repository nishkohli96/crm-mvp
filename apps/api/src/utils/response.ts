import { winstonLogger } from '@/middleware';
import type { Response } from 'express';

type ErrorResponseOptions = {
  error: unknown;
  message?: string;
  statusCode?: number;
};

export function sendErrorResponse(
  res: Response,
  {
    error,
    message = 'Internal Server Error',
    statusCode = 500,
  }: ErrorResponseOptions
) {
  let errorMessage = String(error);
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'object' && error !== null) {
    errorMessage = JSON.stringify(error);
  }

  winstonLogger.error(`⚠ ERROR - ${errorMessage}`);
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    error: errorMessage,
  });
}

type SuccessResponseOptions = {
  data: unknown;
  message?: string;
  statusCode?: number;
  /* eg. pagination details of a list */
  meta?: unknown;
};

export function sendSuccessResponse(
  res: Response,
  { data, message = 'Success', statusCode = 200, meta }: SuccessResponseOptions
) {
  return res.status(statusCode).json({
    success: true,
    status: statusCode,
    message,
    data,
    meta
  });
}
