import { Outlet } from 'react-router';

import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';
import WipStatusMessage from '../components/Banners/WipStatusMessage';

export default function RootLayout() {
  return (
    <>
      <WipStatusMessage />
      <Title />
      <CanonicalUrl />
      <HrefLang />
      <Outlet />
    </>
  );
}
