import { useRouteError } from 'react-router';
import React from 'react';

import { Alert } from '@pxweb2/pxweb2-ui';
import { Header } from '../Header/Header';

// ErrorPage component to display error messages
type RouteError = {
  statusText?: string;
  message?: string;
  status?: number;
  data?: string;
};

// This component is used to display error messages when a route error occurs
// It will therefore always have a route error
export const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;

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
