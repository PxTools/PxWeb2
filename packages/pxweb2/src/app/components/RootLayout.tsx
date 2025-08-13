import { Outlet } from 'react-router';

import { Title, CanonicalUrl, HrefLang } from '../util/seo/headTags';
import { TitleProvider } from '../context/TitleProvider';

export default function RootLayout() {
  return (
    <TitleProvider>
      <Title />
      <CanonicalUrl />
      <HrefLang />
      <Outlet />
    </TitleProvider>
  );
}
