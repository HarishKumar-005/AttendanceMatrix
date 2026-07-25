import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types/index.js';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public fields?: Record<string, string>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    fields?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'An unexpected error occurred';
  let fields: Record<string, string> | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    fields = err.fields;
  } else if (err instanceof Error) {
    message = err.message;
  }

  console.error(`[Error Handler] ${code} (${statusCode}): ${message}`, err.stack);

  const errorResponseBody: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    },
  };

  res.status(statusCode).json(errorResponseBody);
};
