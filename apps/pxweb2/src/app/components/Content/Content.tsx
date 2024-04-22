import React from 'react';
import styles from './Content.module.scss';
import { Button, Heading } from '@pxweb2/pxweb2-ui';
import { getConfig } from '../../util/config/getConfig';
import { useTranslation } from 'react-i18next';

export interface ContentProps {
  children: React.ReactNode;
}

export const Content: React.FC<ContentProps> = ({ children }) => {
  return (
    <div className={styles.contentWrapper}>
      <div className={styles.content}>{children}</div>
    </div>
  );
};
