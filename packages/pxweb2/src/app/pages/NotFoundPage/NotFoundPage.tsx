import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import { Header } from '../../components/Header/Header';
import styles from './NotFoundPage.module.scss';
import { ErrorMessage } from '@pxweb2/pxweb2-ui';

export default function NotFoundPage() {
  const { t } = useTranslation();

  const title = t('common.not_found.title');

  return (
    <>
      <Header />
      <div className={cl(styles.fullScreenContainer)}>
        <main className={cl(styles.mainContent)}>
          <div>Breadcrumbs component here: {title}</div>

          <ErrorMessage
            action="link"
            align="start"
            size="large"
            backgroundShape="circle"
            statusCode={404} // Always 404 for NotFoundPage
            title={title}
            description={t('common.not_found.description')}
            actionText={t('common.not_found.action_text')}
          />
        </main>
      </div>
    </>
  );
}
