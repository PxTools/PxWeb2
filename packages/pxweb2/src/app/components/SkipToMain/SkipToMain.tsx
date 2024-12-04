import React from 'react';
import classes from './SkipToMain.module.scss';
import cl from 'clsx';
import { Link } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';

export const SkipToMain: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className={cl(classes['skip-to-main'], classes['screen-reader-only'])}>
      <Link href="#px-main-content" size="medium">
        {t('common.skip_to_main')}
      </Link>
    </div>
  );
};
