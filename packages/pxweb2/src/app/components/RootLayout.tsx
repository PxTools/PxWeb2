import { Outlet } from 'react-router';

import { DynamicTitle, CanonicalUrl, HrefLang } from '../util/seo/headTags';

export default function RootLayout() {
  return (
    <>
      <DynamicTitle />
      <CanonicalUrl />
      <HrefLang />
      <Outlet />
    </>
  );
}
