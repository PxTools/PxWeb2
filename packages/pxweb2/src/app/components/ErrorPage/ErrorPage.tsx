import React from 'react';
import { Alert } from '@pxweb2/pxweb2-ui';
import { useRouteError } from 'react-router';

type RouteError = {
  statusText?: string;
  message?: string;
};

export const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError | null;
  console.log(error);

  return (
    <Alert variant="error" size="small">
      {error?.statusText || error?.message}
    </Alert>
  );
};

export default ErrorPage;
