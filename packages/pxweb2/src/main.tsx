import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './i18n/config';
import { validateConfig } from './app/util/validate';
import { AppProvider } from './app/context/AppProvider';
import { routerConfig } from './app/routes';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

validateConfig();

const router = createBrowserRouter(routerConfig);

root.render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  </StrictMode>,
);
