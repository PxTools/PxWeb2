import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import { validateConfig } from './app/util/validate';
import App from './app/app';
import './i18n/config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// eslint-disable-next-line no-restricted-globals
if (location.href.indexOf('localhost') > -1) {
  validateConfig();
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
