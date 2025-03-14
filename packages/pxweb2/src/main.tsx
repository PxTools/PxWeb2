import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './i18n/config';

import { validateConfig } from './app/util/validate';
import TableView from './app/TableView/TableView';
import App from './app/app';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/table/:tableId',
    element: <TableView />,
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

if (location.href.includes('localhost')) {
  validateConfig();
}

root.render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
);
