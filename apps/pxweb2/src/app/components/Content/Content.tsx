import React from 'react';
import styles from './Content.module.scss';
import cl from 'clsx';
import { TableView } from './TableView/TableView';

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
      <div className={styles.content}>
        {children}
        <TableView />
      </div>
    </div>
  );
};
