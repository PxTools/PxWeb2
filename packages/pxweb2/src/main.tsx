import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';

import './i18n/config';
import { validateConfig } from './app/util/validate';
import { AppProvider } from './app/context/AppProvider';
import { router } from './app/routes';

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
