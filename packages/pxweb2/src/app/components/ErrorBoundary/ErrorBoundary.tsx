import { Component, ErrorInfo, ReactNode } from 'react';

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

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.log('ErrorBoundary getDerivedStateFromError called with:', {
      error,
      errorName: error.name,
      errorConstructor: error.constructor.name,
      isApiProblemError: error instanceof ApiProblemError,
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (error instanceof ApiProblemError) {
      console.log(`API Error (${error.status}):`, error.message, info);

      if (error.hasStatus(404)) {
        console.log('404 Not Found error caught by error boundary:', {
          tableId: error.selectedTabId,
          originalError: error.originalError,
        });
      }
    } else {
      console.log('Generic error caught by error boundary:', error, info);
    }
  }

  render() {
    console.log('ErrorBoundary render called with state:', this.state);

    if (this.state.hasError) {
      console.log('ErrorBoundary: hasError is true, rendering error UI');

      // If a fallback UI is provided, render that
      if (this.props.fallback) {
        console.log('ErrorBoundary: Using provided fallback');
        return this.props.fallback;
      }

      // Check if this is a 404 error from API
      console.log('ErrorBoundary render - Error details:', {
        error: this.state.error,
        errorName: this.state.error?.name,
        errorConstructor: this.state.error?.constructor?.name,
        isApiProblemError: this.state.error instanceof ApiProblemError,
        status:
          this.state.error instanceof ApiProblemError
            ? this.state.error.status
            : 'N/A',
      });

      // Check for 404 errors more explicitly
      const isApiProblemError = this.state.error instanceof ApiProblemError;
      const errorName = this.state.error?.name;
      const errorStatus =
        isApiProblemError && this.state.error
          ? (this.state.error as ApiProblemError).status
          : null;
      const hasStatus404 =
        isApiProblemError && this.state.error
          ? (this.state.error as ApiProblemError).hasStatus(404)
          : false;

      console.log('ErrorBoundary: 404 check details:', {
        isApiProblemError,
        errorName,
        errorStatus,
        hasStatus404,
        willRenderNotFound: isApiProblemError && hasStatus404,
      });

      if (isApiProblemError && hasStatus404) {
        console.log('ErrorBoundary: Rendering NotFound component for 404');
        return <NotFound />;
      }

      // Alternative check in case instanceof fails but name matches
      if (errorName === 'ApiProblemError' && errorStatus === 404) {
        console.log(
          'ErrorBoundary: Rendering NotFound via fallback name check',
        );
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
