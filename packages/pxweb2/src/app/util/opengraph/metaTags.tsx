import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

import useApp from '../../context/useApp';
import { getCanonicalUrl } from '../urlUtil';

function OpenGraphTitle() {
  const { title } = useApp();
  const { t } = useTranslation();
  const ogTitle = title || t('common.title');

  return <meta property="og:title" content={ogTitle} />;
}

function OpenGraphSiteName() {
  const { t } = useTranslation();

  return <meta property="og:site_name" content={t('opengraph.site_name')} />;
}

function OpenGraphType() {
  return <meta property="og:type" content="website" />;
}

function OpenGraphUrl() {
  const location = useLocation();
  const url = getCanonicalUrl(location.pathname);

  return <meta property="og:url" content={url} />;
}

function OpenGraphLocale() {
  const { i18n } = useTranslation();

  return <meta property="og:locale" content={i18n.language} />;
}

export default function OpenGraphMetaTags() {
  return (
    <>
      <OpenGraphTitle />
      <OpenGraphSiteName />
      <OpenGraphType />
      <OpenGraphUrl />
      <OpenGraphLocale />
    </>
  );
}
