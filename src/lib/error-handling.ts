/**
 * Comprehensive Error Handling System
 * Centralized error logging, recovery, and user-friendly error messages
 */

import { prisma } from "./prisma";
import { maskPii } from "./pii-mask";

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  RECORD_NOT_FOUND = 'RECORD_NOT_FOUND',
  DUPLICATE_RECORD = 'DUPLICATE_RECORD',
  FOREIGN_KEY_VIOLATION = 'FOREIGN_KEY_VIOLATION',
  
  // External Services
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  
  // System
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  TIMEOUT = 'TIMEOUT',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  userMessage: string;
  details?: Record<string, unknown>;
  statusCode: number;
  retryable: boolean;
  context?: {
    userId?: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
    path?: string;
  };
}

export class ErrorContext {
  constructor(
    public userId?: string,
    public requestId?: string,
    public ip?: string,
    public userAgent?: string,
    public path?: string
  ) {}
}

/**
 * Create a standardized application error
 */
export function createAppError(
  code: ErrorCode,
  message: string,
  userMessage?: string,
  details?: Record<string, unknown>,
  context?: ErrorContext
): AppError {
  const statusCodeMap: Record<ErrorCode, number> = {
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.INVALID_TOKEN]: 401,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.INVALID_INPUT]: 400,
    [ErrorCode.MISSING_REQUIRED_FIELD]: 400,
    [ErrorCode.DATABASE_ERROR]: 500,
    [ErrorCode.RECORD_NOT_FOUND]: 404,
    [ErrorCode.DUPLICATE_RECORD]: 409,
    [ErrorCode.FOREIGN_KEY_VIOLATION]: 400,
    [ErrorCode.EXTERNAL_API_ERROR]: 502,
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
    [ErrorCode.BUSINESS_RULE_VIOLATION]: 422,
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
    [ErrorCode.QUOTA_EXCEEDED]: 429,
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
    [ErrorCode.TIMEOUT]: 408,
    [ErrorCode.CONFIGURATION_ERROR]: 500,
  };

  const retryableErrors = new Set([
    ErrorCode.EXTERNAL_API_ERROR,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.TIMEOUT,
    ErrorCode.DATABASE_ERROR,
  ]);

  return {
    code,
    message,
    userMessage: userMessage || getFriendlyErrorMessage(code),
    details,
    statusCode: statusCodeMap[code],
    retryable: retryableErrors.has(code),
    context: context ? {
      userId: context.userId,
      requestId: context.requestId,
      ip: context.ip,
      userAgent: context.userAgent,
      path: context.path,
    } : undefined,
  };
}

/**
 * Get user-friendly error messages
 */
function getFriendlyErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.UNAUTHORIZED]: 'Please sign in to continue',
    [ErrorCode.FORBIDDEN]: 'You don\'t have permission to perform this action',
    [ErrorCode.INVALID_TOKEN]: 'Your session has expired. Please sign in again',
    [ErrorCode.VALIDATION_ERROR]: 'Please check your input and try again',
    [ErrorCode.INVALID_INPUT]: 'The information you provided is not valid',
    [ErrorCode.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields',
    [ErrorCode.DATABASE_ERROR]: 'Something went wrong. Please try again',
    [ErrorCode.RECORD_NOT_FOUND]: 'The requested information was not found',
    [ErrorCode.DUPLICATE_RECORD]: 'This already exists in our system',
    [ErrorCode.FOREIGN_KEY_VIOLATION]: 'Invalid reference to another record',
    [ErrorCode.EXTERNAL_API_ERROR]: 'Unable to connect to external service. Please try again',
    [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Too many requests. Please wait and try again',
    [ErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later',
    [ErrorCode.BUSINESS_RULE_VIOLATION]: 'This action is not allowed',
    [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'You need higher permissions to perform this action',
    [ErrorCode.QUOTA_EXCEEDED]: 'You\'ve reached your limit. Please upgrade your plan',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong. Our team has been notified',
    [ErrorCode.TIMEOUT]: 'Request took too long. Please try again',
    [ErrorCode.CONFIGURATION_ERROR]: 'System configuration issue. Please contact support',
  };

  return messages[code] || 'An unexpected error occurred. Please try again';
}

/**
 * Log error to database and external monitoring
 */
export async function logError(error: AppError, originalError?: Error | unknown): Promise<void> {
  try {
    // Log to database for internal tracking
    await prisma.errorLog.create({
      data: {
        code: error.code,
        message: error.message,
        userMessage: error.userMessage,
        details: maskPii(error.details || {}) as Record<string, unknown>,
        statusCode: error.statusCode,
        retryable: error.retryable,
        userId: error.context?.userId,
        requestId: error.context?.requestId,
        ip: error.context?.ip,
        userAgent: error.context?.userAgent,
        path: error.context?.path,
        stackTrace: originalError instanceof Error ? originalError.stack : undefined,
        timestamp: new Date(),
      },
    }).catch(() => {
      // If database logging fails, fall back to console
      console.error('Failed to log error to database:', error);
    });

    // Log to console with structured format
    console.error('Application Error:', {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
      retryable: error.retryable,
      context: error.context,
      timestamp: new Date().toISOString(),
    });

    // TODO: Send to external monitoring service (Sentry, etc.)
    // await sendToMonitoring(error, originalError);
  } catch (loggingError) {
    // Last resort - console logging
    console.error('Failed to log error:', {
      originalError: error,
      loggingError,
    });
  }
}

/**
 * Handle errors in API routes with consistent response format
 */
export function handleApiError(error: AppError | Error | unknown, context?: ErrorContext): Response {
  let appError: AppError;

  if (error && typeof error === 'object' && 'code' in error) {
    // Already an AppError
    appError = error as AppError;
  } else if (error instanceof Error) {
    // Convert Error to AppError
    appError = createAppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error.message,
      undefined,
      { stackTrace: error.stack },
      context
    );
  } else {
    // Unknown error type
    appError = createAppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      'Unknown error occurred',
      undefined,
      { originalError: String(error) },
      context
    );
  }

  // Log the error
  logError(appError, error).catch(() => {
    // Logging failed, but we still need to return the response
    console.error('Failed to log error in handleApiError');
  });

  // Return consistent error response
  return new Response(
    JSON.stringify({
      error: {
        code: appError.code,
        message: appError.userMessage,
        retryable: appError.retryable,
        requestId: appError.context?.requestId,
      },
    }),
    {
      status: appError.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  context?: ErrorContext
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        // Already an AppError, re-throw
        throw error;
      }
      
      // Convert to AppError and throw
      throw createAppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        { originalError: String(error) },
        context
      );
    }
  };
}

/**
 * Retry mechanism for retryable operations
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  context?: ErrorContext
): Promise<T> {
  let lastError: Error | unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (error && typeof error === 'object' && 'retryable' in error) {
        const appError = error as AppError;
        if (!appError.retryable || attempt === maxRetries) {
          throw error;
        }
      } else {
        // Unknown error type, don't retry
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));

      // Log retry attempt
      console.warn(`Retrying operation (attempt ${attempt + 1}/${maxRetries + 1})`, {
        error: error instanceof Error ? error.message : String(error),
        delay,
        context,
      });
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Create error context from request
 */
export function createErrorContext(request: Request, userId?: string): ErrorContext {
  const url = new URL(request.url);
  
  return new ErrorContext(
    userId,
    request.headers.get('x-request-id') || crypto.randomUUID(),
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    request.headers.get('user-agent') || 'unknown',
    url.pathname
  );
}
