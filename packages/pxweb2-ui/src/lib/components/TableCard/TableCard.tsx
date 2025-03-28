import React, { type ReactNode, forwardRef } from 'react';
import cl from 'clsx';
import styles from './TableCard.module.scss';
import { Icon } from '../Icon/Icon';

interface TableCardProps {
  href?: string;
  tableId?: string;
  title?: string;
  icon?: ReactNode;
  period?: string;
  frequency?: string;
  updatedLabel?: string;
  lastUpdated?: string;
  status?: 'active' | 'closed';
}

export const TableCard = forwardRef<HTMLAnchorElement, TableCardProps>(
  (
    {
      href,
      icon,
      tableId,
      title,
      period,
      frequency,
      updatedLabel,
      lastUpdated,
      status = 'active',
    },
    ref,
  ) => (
    <div className={cl(styles.tableCard)}>
      {icon && (
        <div className={cl(styles.iconWrapper, styles[status])}>{icon}</div>
      )}
      <div className={cl(styles.cardContent)}>
        <div className={cl(styles.titleWrapper)}>
          <a
            href={href}
            ref={ref}
            className={cl(styles.title, styles['heading-small'])}
          >
            {title}
          </a>
        </div>
        <div className={cl(styles.tableMeta)}>
          <div className={cl(styles.timeWrapper)}>
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
            {lastUpdated && (
              <div className={cl(styles.lastUpdated)}>
                <Icon iconName="Clock" />
                <span className={cl(styles['bodyshort-small'])}>
                  {updatedLabel} {lastUpdated}
                </span>
              </div>
            )}
          </div>
          {tableId && (
            <span className={cl(styles.tableId, styles['label-small'])}>
              {tableId}
            </span>
          )}
        </div>
      </div>
    </div>
  ),
);
export default TableCard;
