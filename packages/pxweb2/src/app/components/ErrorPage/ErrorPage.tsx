import React from 'react';
import { Alert } from '@pxweb2/pxweb2-ui';
import { useRouteError } from 'react-router';

type RouteError = {
  statusText?: string;
  message?: string;
  status?: number;
  data?: string;
};

export const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError | null;
  console.log(error);

  return (
    <Alert variant="error" size="small">
      <div>{error?.status} {error?.statusText} {error?.message} {error?.data}</div>
    </Alert>
  );
};

export default ErrorPage;
