import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';

import './i18n/config';
import App from './app/app';
import { validateConfig } from './app/util/validate';
import { VariablesProvider } from './app/context/VariablesProvider';
import { TableDataProvider } from './app/context/TableDataProvider';

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
  document.getElementById('root') as HTMLElement
);

// eslint-disable-next-line no-restricted-globals
if (location.href.indexOf('localhost') > -1) {
  validateConfig();
}

root.render(
  <StrictMode>
    <VariablesProvider>
      <TableDataProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
      </TableDataProvider>
    </VariablesProvider>
  </StrictMode>
);
