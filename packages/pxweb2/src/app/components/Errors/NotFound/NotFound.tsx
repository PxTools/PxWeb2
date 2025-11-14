import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Breadcrumbs } from '@pxweb2/pxweb2-ui';
import { ErrorLayout } from '../ErrorLayout';
import { ErrorMessage } from '../../ErrorMessage/ErrorMessage';
import useApp from '../../../context/useApp';
import {
  createBreadcrumbItems,
  BreadcrumbItemsParm,
} from '../../../util/createBreadcrumbItems';

export function NotFound() {
  const { t, i18n } = useTranslation();
  const { isTablet } = useApp();
  const notFoundLabel = t('common.errors.not_found.title');

  const location = useLocation();

  const breadcrumbItemsOptions: BreadcrumbItemsParm = {
    currentPage: { label: notFoundLabel, href: location.pathname },
    language: i18n.language,
    t: t,
  };

  const breadcrumbItems = createBreadcrumbItems(breadcrumbItemsOptions);
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
