import { Outlet } from 'react-router';

import useLocalizeDocumentAttributes from '../../i18n/useLocalizeDocumentAttributes';
import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';
import ErrorBoundary from './ErrorBoundary/ErrorBoundary';
import WipStatusMessage from '../components/Banners/WipStatusMessage';

export default function RootLayout() {
  useLocalizeDocumentAttributes();

  return (
    <>
      <WipStatusMessage />
      <Title />
      <CanonicalUrl />
      <HrefLang />
      <ErrorBoundary>
        <Outlet />
      </ErrorBoundary>
    </>
  );
}
