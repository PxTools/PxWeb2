import * as React from 'react';
import { Alert } from '@pxweb2/pxweb2-ui';

import { ErrorInfo } from 'react';

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
    // logErrorToMyService(
    //   error,
    //   // Example "componentStack":
    //   //   in ComponentThatThrows (created by App)
    //   //   in ErrorBoundary (created by App)
    //   //   in div (created by App)
    //   //   in App
    //   info.componentStack,
    //   // Only available in react@canary.
    //   // Warning: Owner Stack is not available in production.
    //   React.captureOwnerStack(),
    // );
  }

  render() {
    return (
      <>
        {this.state.hasError && (
          <Alert variant="error" size="small">
            {this.state.error?.message}
          </Alert>
        )}
        {this.props.children}
      </>
    );
  }
}

export default ErrorBoundary;
