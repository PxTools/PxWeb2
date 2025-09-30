import { Component, ReactNode } from 'react';

import { GenericError } from '../Errors/GenericError/GenericError';
import { NotFound } from '../Errors/NotFound/NotFound';
import { ApiProblemError } from '../../util/ApiProblemError';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  /**
   * Enhanced error status detection that handles multiple error formats
   */
  private getErrorStatus(error: Error): number | null {
    // 1. Check if it's already an ApiProblemError (preferred format)
    if (error instanceof ApiProblemError) {
      return error.status;
    }

    // 2. Parse HTTP status code from error message beginning (problemMessage format)
    // Example: "404\n          TableId: TAB60065 \n          Not Found\n           - https://..."
    const statusMatch = error.message.match(/^(\d{3})/);
    if (statusMatch) {
      const status = Number.parseInt(statusMatch[1], 10);

      return status;
    }

    // 3. Check for status patterns within the message
    const statusInMessage = error.message.match(/(\d{3})/);
    if (statusInMessage) {
      const status = Number.parseInt(statusInMessage[1], 10);

      // Validate it's a real HTTP status code
      if (status >= 100 && status < 600) {
        return status;
      }
    }

    // 4. Check for common error keywords
    if (
      error.message.includes('404') ||
      error.message.toLowerCase().includes('not found') ||
      error.message.toLowerCase().includes('table not found')
    ) {
      return 404;
    }

    if (
      error.message.toLowerCase().includes('server error') ||
      error.message.includes('500')
    ) {
      return 500;
    }

    return null;
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // NOSONAR: Add optional logging here if needed
  // componentDidCatch(error: Error, info: ErrorInfo) {
  //
  // }

  render() {
    if (this.state.hasError) {
      // If a fallback UI is provided, render that
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // If no error object is available, render a generic error
      if (!this.state.error) {
        return <GenericError />;
      }

      // Use enhanced error detection
      const detectedStatus = this.getErrorStatus(this.state.error);

      // Check for 404 errors using enhanced detection
      if (detectedStatus === 404) {
        return <NotFound />;
      }

      // Check for ApiProblemError
      if (
        this.state.error instanceof ApiProblemError &&
        this.state.error.hasStatus(404)
      ) {
        return <NotFound />;
      }

      // Default error UI for all other errors
      return <GenericError />;
    }

    // When there's no error, render children
    return this.props.children;
  }
}

export default ErrorBoundary;
