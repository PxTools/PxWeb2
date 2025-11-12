import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';

import { Breadcrumbs } from '@pxweb2/pxweb2-ui';
import { ErrorLayout } from '../ErrorLayout';
import { ErrorMessage } from '../../ErrorMessage/ErrorMessage';
import useApp from '../../../context/useApp';
import { createBreadcrumbItems } from '../../../util/createBreadcrumbItems';

export function NotFound() {
  const { t, i18n } = useTranslation();
  const { isTablet } = useApp();
  const notFoundLabel = t('common.errors.not_found.title');

  const location = useLocation();
  const breadcrumbItems = createBreadcrumbItems(
    location.pathname,
    t,
    i18n.language,
    notFoundLabel,
  );
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
