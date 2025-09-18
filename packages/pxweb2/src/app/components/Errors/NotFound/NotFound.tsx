import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

import { Breadcrumbs, BreadcrumbItem } from '@pxweb2/pxweb2-ui';
import { ErrorLayout } from '../ErrorLayout';
import { ErrorMessage } from '../../ErrorMessage';
import { getConfig } from '../../../util/config/getConfig';
import useApp from '../../../context/useApp';

function getBreadcrumbItems(
  language: string,
  locationPath: string = '',
  t: TFunction,
): BreadcrumbItem[] {
  const config = getConfig();
  const breadcrumbItems: BreadcrumbItem[] = [];
  const showLangInPath =
    config.language.showDefaultLanguageInPath ||
    language !== config.language.defaultLanguage;
  const langPrefix = showLangInPath ? `/${language}` : '';

  // Add root/home and current page to breadcrumbs
  breadcrumbItems.push({
    label: t('common.breadcrumbs.breadcrumb_root_title'),
    href: langPrefix,
  });
  breadcrumbItems.push({
    label: t('common.errors.not_found.title'),
    href: `${locationPath}`,
  });

  return breadcrumbItems;
}

export function NotFound() {
  const { t, i18n } = useTranslation();
  const { isTablet } = useApp();
  const locationPath = useLocation().pathname;
  const language = i18n.language;

  const breadcrumbItems = getBreadcrumbItems(language, locationPath, t);
  const breadcrumbsVariant = isTablet ? 'compact' : 'default';

  return (
    <ErrorLayout align="start">
      <Breadcrumbs
        breadcrumbItems={breadcrumbItems}
        variant={breadcrumbsVariant}
      />

      <ErrorMessage
        action="link"
        align="start"
        illustration="NotFound"
        backgroundShape="wavy"
        title={t('common.errors.not_found.title')}
        description={t('common.errors.not_found.description')}
        actionText={t('common.errors.not_found.action_text')}
      />
    </ErrorLayout>
  );
}
