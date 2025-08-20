import { Outlet } from 'react-router';

import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';
import OpenGraphMetaTags from '../util/opengraph/metatags';

export default function RootLayout() {
  return (
    <>
      <Title />
      <CanonicalUrl />
      <HrefLang />
      <OpenGraphMetaTags />
      <Outlet />
    </>
  );
}
