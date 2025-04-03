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
  console.error(error);

  return (
    <>
      <Header></Header>
      <Alert variant="error" size="small">
        <div>
          {error?.status} {error?.statusText} {error?.message} {error?.data}
        </div>
      </Alert>
    </>
  );
};

export default ErrorPage;
