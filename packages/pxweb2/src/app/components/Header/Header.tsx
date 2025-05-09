import React from 'react';
import cl from 'clsx';

import styles from './Header.module.scss';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
export const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className={styles.header}>
      <div>
        <span className={cl(styles['heading-medium'])}>
          {t('common.header.title')}
        </span>
      </div>
      <LanguageSwitcher />
    </header>
  );
};
