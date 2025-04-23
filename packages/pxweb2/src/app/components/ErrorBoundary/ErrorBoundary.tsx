import * as React from 'react';
import { Alert } from '@pxweb2/pxweb2-ui';
import { ErrorInfo } from 'react';
import { Header } from '../Header/Header';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <Header></Header>
          <Alert variant="error" size="small">
            {this.state.error?.message}
          </Alert>
        </>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
