import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';

import './i18n/config';
import App from './app/app';
import { validateConfig } from './app/util/validate';
import { VariablesProvider } from './app/context/VariablesProvider';
import { TableDataProvider } from './app/context/TableDataProvider';
import { AccessibilityProvider } from './app/context/AccessibilityProvider';
import { AppProvider } from './app/context/AppProvider';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/table/tab638" replace={true} />,
  },
  {
    path: '/table/:tableId',
    element: <App />,
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
      <AccessibilityProvider>
        <VariablesProvider>
          <TableDataProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <RouterProvider router={router} />
            </Suspense>
          </TableDataProvider>
        </VariablesProvider>
      </AccessibilityProvider>
    </AppProvider>
  </StrictMode>,
);
