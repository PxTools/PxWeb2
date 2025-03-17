import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';

import './i18n/config';
import TableViewer from './app/pages/TableViewer/TableViewer';
import { validateConfig } from './app/util/validate';
import { AppProvider } from './app/context/AppProvider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/table/tab638" replace={true} />,
  },
  {
    path: '/table/:tableId',
    element: <TableViewer />,
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
    <AppProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  </StrictMode>,
);
