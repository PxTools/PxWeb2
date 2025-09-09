import { Outlet } from 'react-router';

import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';
import ErrorBoundary from './ErrorBoundry/ErrorBoundry';

export default function RootLayout() {
  return (
    <>
      <Title />
      <CanonicalUrl />
      <HrefLang />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </>
  );
}
