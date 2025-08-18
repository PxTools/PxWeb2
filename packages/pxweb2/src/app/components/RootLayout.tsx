import { Outlet } from 'react-router';

import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';

export default function RootLayout() {
  return (
    <>
      <Title />
      <CanonicalUrl />
      <HrefLang />
      <Outlet />
    </>
  );
}
