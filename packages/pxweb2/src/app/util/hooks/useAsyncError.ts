import { useCallback, useState } from 'react';

// Hook to throw errors from async code to be caught by an ErrorBoundary
export function useAsyncError() {
  const [error, setError] = useState<Error | null>(null);

  const throwError = useCallback((error: Error) => {
    setError(error);
  }, []);

  if (error) {
    throw error;
  }

  return throwError;
}
