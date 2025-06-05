import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import './i18n/config';
import { validateConfig } from './app/util/validate';
import { AppProvider } from './app/context/AppProvider';
import { FilterProvider } from './app/context/FilterContext';
import { routerConfig } from './app/routes';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

if (location.href.includes('localhost')) {
  validateConfig();
}

const router = createBrowserRouter(routerConfig);

root.render(
  <StrictMode>
    <AppProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <FilterProvider>
          <RouterProvider router={router} />
        </FilterProvider>
      </Suspense>
    </AppProvider>
  </StrictMode>,
);
