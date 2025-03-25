import React, { type ReactNode } from 'react';
import cl from 'clsx';
import styles from './TableCard.module.scss';
import Heading from '../Typography/Heading/Heading';

interface TableCardProps {
  tableId?: string;
  title?: string;
  icon?: ReactNode;
  period?: string;
  frequency?: string;
  lastUpdated?: string;
  size?: 'medium' | 'small' | 'xsmall';
  status?: 'active' | 'closed';
}

export const TableCard: React.FC<TableCardProps> = ({
  icon,
  tableId,
  title,
  period,
  frequency,
  lastUpdated,
  size = 'medium',
  status = 'active',
}) => (
  <div className={cl(styles.tableCard, styles[size])}>
    {icon && (
      <div className={cl(styles.iconWrapper, styles[status])}>{icon}</div>
    )}
    <div className={cl(styles.cardContent)}>
      <div className={cl(styles.titleWrapper)}>
        <Heading size="small" level="2">
          {title}
        </Heading>
      </div>
      <div className={cl(styles.tableMeta)}>
        {period && (
          <span className={cl(styles.period, styles['heading-xsmall'])}>
            {period}
          </span>
        )}
        {frequency && (
          <span className={cl(styles.frequency, styles['label-small'])}>
            {frequency}
          </span>
        )}
        {lastUpdated && size === 'medium' && (
          <span className={cl(styles.lastUpdated, styles['bodyshort-small'])}>
            {lastUpdated}
          </span>
        )}
        {tableId && (
          <span className={cl(styles.tableId, styles['label-small'])}>
            {tableId}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default TableCard;
