import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';
import { validateConfig } from './app/util/validate';
import App from './app/app';
import './i18n/config';
import { VariablesProvider } from './app/context/VariablesProvider';
import { TableDataProvider } from './app/context/TableDataProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// eslint-disable-next-line no-restricted-globals
if (location.href.indexOf('localhost') > -1) {
  validateConfig();
}

root.render(
  <StrictMode>
    <TableDataProvider>
      <VariablesProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <App />
        </Suspense>
      </VariablesProvider>
    </TableDataProvider>
  </StrictMode>
);
