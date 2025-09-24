import { Component, ErrorInfo, ReactNode } from 'react';

import { GenericError } from '../Errors/GenericError/GenericError';

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
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      // If a fallback UI is provided, render that
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return <GenericError />;
    }

    // When there's no error, render children
    return this.props.children;
  }
}

export default ErrorBoundary;
