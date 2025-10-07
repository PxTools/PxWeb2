import React from 'react';
import styles from './Content.module.scss';
import cl from 'clsx';
import { Footer } from '../Footer/Footer';

export interface ContentProps {
  children: React.ReactNode;
  topLeftBorderRadius: boolean;
}

export const Content: React.FC<ContentProps> = ({
  children,
  topLeftBorderRadius,
}) => {
  return (
    <div
      className={cl(styles.contentWrapper, {
        [styles.topLeftBorderRadius]: topLeftBorderRadius,
      })}
    >
      <div>
        <div className={styles.content}>{children}</div>
      </div>
      <Footer variant="tableview" />
    </div>
  );
};
