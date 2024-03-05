import { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from './app/app';
import './i18n/config';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  </StrictMode>
);
