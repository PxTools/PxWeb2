import { isRouteErrorResponse, useRouteError } from 'react-router';
import React from 'react';

import {
  GenericError,
  GenericErrorTableViewer,
} from '../../components/Errors/GenericError/GenericError';
import { NotFound } from '../../components/Errors/NotFound/NotFound';
import useLocalizeDocumentAttributes from '../../../i18n/useLocalizeDocumentAttributes';

type RouteError = {
  statusText?: string;
  message?: string;
  status?: number;
  data?: string;
};

type ErrorPageProps = {
  variant?: 'default' | 'tableViewer';
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  variant = 'default',
}) => {
  const error = useRouteError() as RouteError;

  // If expanding the error handling in the future, read this:
  // https://reactrouter.com/how-to/error-boundary
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }
  }

  // Handle all errors not specifically handled above
  return variant === 'tableViewer' ? (
    <GenericErrorTableViewer />
  ) : (
    <GenericError />
  );
};

// Wrapper for router-level errors
export function ErrorPageWithLocalization() {
  useLocalizeDocumentAttributes();

  return <ErrorPage />;
}

// For TableViewer component errors
export function ErrorPageTableViewer() {
  return <ErrorPage variant="tableViewer" />;
}

export default ErrorPage;
