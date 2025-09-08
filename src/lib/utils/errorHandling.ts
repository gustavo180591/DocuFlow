/**
 * Unified error handling utilities
 */

type ErrorLike = Error | string | unknown;

/**
 * Safely extracts error message from various error types
 */
export function getErrorMessage(error: ErrorLike): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message);
  }
  return 'Error desconocido';
}

/**
 * Creates a type-safe error handler that returns a consistent error format
 */
export function createErrorHandler(prefix = 'Error') {
  return (error: ErrorLike, context?: string): { message: string; context?: string } => {
    const message = getErrorMessage(error);
    return {
      message: `${prefix}: ${message}`,
      ...(context && { context })
    };
  };
}

/**
 * Wraps an async function with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  onError?: (error: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const errorObj = error instanceof Error ? error : new Error(errorMessage);
    
    if (onError) {
      onError(errorObj);
    } else {
      console.error('Unhandled error:', errorObj);
    }
    
    return null;
  }
}
