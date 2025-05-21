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

/**
 * TODO:
 * Routing:
 * The routing works as expected when default language is in the URL
 * - changes correctly to new, supported language DONE
 * - shows language not supported when language part in URL does not match a supported language DONE
 * - REDIRECT to default language when no language in url, does not work
 *
 * The routing works as expected when default language is not in the URL
 * - correctly shows default language when it is NOT in the URL DONE
 * - correctly shows new, supported language when it is in the URL DONE
 * - shows language not supported when no language part in URL, or language part in URL does not match a supported language DONE
 *
 * Routing:
 * - Add NotFound component
 *   - Make it take in language text
 *
 * Code:
 * - Move the routing to a separate file
 * - Tests?
 */

console.log('router', router);

root.render(
  <StrictMode>
    <AppProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProvider>
  </StrictMode>,
);
