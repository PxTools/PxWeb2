import { useTranslation } from 'react-i18next';

import { Alert } from '@pxweb2/pxweb2-ui';
import { Header } from '../../components/Header/Header';

interface NotFoundProps {
  readonly type: 'page_not_found' | 'unsupported_language';
}

export function NotFound({ type }: NotFoundProps) {
  const { t } = useTranslation();

  return (
    <>
      <Header />
      <Alert heading={t(`common.not_found.${type}.title`)} variant="warning">
        {t(`common.not_found.${type}.description`)}
      </Alert>
    </>
  );
}
