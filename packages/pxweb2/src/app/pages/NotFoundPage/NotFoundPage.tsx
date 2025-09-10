import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import { Header } from '../../components/Header/Header';
import styles from './NotFoundPage.module.scss';
import { ErrorMessage } from '../../components/ErrorMessage';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const title = t('common.errors.not_found.title');

  return (
    <>
      <Header />
      <div className={cl(styles.fullScreenContainer)}>
        <main className={cl(styles.mainContent)}>
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
        </main>
      </div>
    </>
  );
}
