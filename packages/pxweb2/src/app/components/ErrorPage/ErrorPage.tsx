import React from 'react';
import { Alert } from '@pxweb2/pxweb2-ui';
import { useRouteError } from 'react-router';
import { Header } from '../Header/Header';

type RouteError = {
  statusText?: string;
  message?: string;
  status?: number;
  data?: string;
};

export const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError | null;

  return (
    <>
      <Header></Header>
      <Alert variant="error" size="small">
        {error?.status} {error?.statusText} {error?.message} {error?.data}
      </Alert>
    </>
  );
};

export default ErrorPage;
