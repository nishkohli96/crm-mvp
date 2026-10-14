/**
 * Throw this from a service/controller to respond with `status`. The
 * errorHandler middleware reads `status` and sends `message` to the client.
 */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
