import { useRouteError } from 'react-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import styles from './ErrorPageTableViewer.module.scss';
import { Header } from '../../components/Header/Header';
import { ErrorMessage } from '../../components/ErrorMessage';

type RouteError = {
  statusText?: string;
  message?: string;
  status?: number;
  data?: string;
};

// This component is used to display error messages when a route error occurs
// on the TableViewer page. It will therefore always have a route error
export const ErrorPageTableViewer: React.FC = () => {
  const error = useRouteError() as RouteError;
  const { t } = useTranslation();
  const title = t('common.errors.generic.title');

  if (error.status === 404) {
    return <div>404 - Not found</div>;
  }

  return (
    <>
      <Header />
      <div className={cl(styles.fullScreenContainer)}>
        <main className={cl(styles.mainContent)}>
          <ErrorMessage
            action="button"
            align="center"
            illustration="GenericError"
            backgroundShape="wavy"
            title={title}
            description={t('common.errors.generic.description')}
            actionText={t('common.errors.generic.action_text')}
          />
        </main>
      </div>
    </>
  );
};

export default ErrorPageTableViewer;
