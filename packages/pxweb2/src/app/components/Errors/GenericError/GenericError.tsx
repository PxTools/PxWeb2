import { useTranslation } from 'react-i18next';

import { ErrorLayout } from '../ErrorLayout';
import { ErrorMessage } from '../../ErrorMessage/ErrorMessage';

export function GenericError() {
  const { t } = useTranslation();

  return (
    <ErrorLayout>
      <ErrorMessage
        action="button"
        align="center"
        illustration="GenericError"
        backgroundShape="wavy"
        title={t('common.errors.generic.title')}
        description={t('common.errors.generic.description')}
        actionText={t('common.errors.generic.action_text')}
      />
    </ErrorLayout>
  );
}
