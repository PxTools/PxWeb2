import { Outlet } from 'react-router';

import useLocalizeDocumentAttributes from '../../i18n/useLocalizeDocumentAttributes';
import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';
import ErrorBoundary from './ErrorBoundry/ErrorBoundry';

export default function RootLayout() {
  useLocalizeDocumentAttributes();

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
