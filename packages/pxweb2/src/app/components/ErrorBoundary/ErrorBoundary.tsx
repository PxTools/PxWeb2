import { Component, ReactNode } from 'react';

import { GenericError } from '../Errors/GenericError/GenericError';
import { NotFound } from '../Errors/NotFound/NotFound';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // NOSONAR: Add error logging here later if wanted
  // componentDidCatch(error: Error, info: ErrorInfo) {
  //   console.log(error, info);
  // }

  render() {
    if (this.state.hasError) {
      // Parse status code from error message if possible
      const statusInMessage = this.state.error?.message.match(/(\d{3})/);
      if (statusInMessage) {
        const status = Number.parseInt(statusInMessage[1], 10);

        // Check for 404 code in error message
        if (status === 404) {
          return <NotFound />;
        }
      }

      // Default error component for all other errors
      return <GenericError />;
    }

    // When there's no error, render children
    return this.props.children;
  }
}

export default ErrorBoundary;
