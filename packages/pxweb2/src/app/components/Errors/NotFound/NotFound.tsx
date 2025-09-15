import { useTranslation } from 'react-i18next';

import { ErrorLayout } from '../ErrorLayout';
import { ErrorMessage } from '../../ErrorMessage';

export function NotFound() {
  const { t } = useTranslation();
  const title = t('common.errors.not_found.title');

  return (
    <ErrorLayout>
      <div>Breadcrumbs component here: {title}</div>

      <ErrorMessage
        action="link"
        align="start"
        illustration="NotFound"
        backgroundShape="wavy"
        title={title}
        description={t('common.errors.not_found.description')}
        actionText={t('common.errors.not_found.action_text')}
      />
    </ErrorLayout>
  );
}
