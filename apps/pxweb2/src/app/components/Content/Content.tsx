import React from 'react';
import styles from './Content.module.scss';

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
