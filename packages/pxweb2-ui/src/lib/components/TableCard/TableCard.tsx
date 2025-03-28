import { type ReactNode, forwardRef } from 'react';
import cl from 'clsx';
import styles from './TableCard.module.scss';
import { Icon } from '../Icon/Icon';

interface TableCardProps {
  ariaLabel?: string;
  frequency?: string;
  href?: string;
  icon?: ReactNode;
  lastUpdated?: string;
  period?: string;
  status?: 'active' | 'closed';
  tableId?: string;
  title?: string;
  updatedLabel?: string;
}

export const TableCard = forwardRef<HTMLAnchorElement, TableCardProps>(
  (
    {
      ariaLabel,
      frequency,
      href,
      icon,
      lastUpdated,
      period,
      status = 'active',
      tableId,
      title,
      updatedLabel,
    },
    ref,
  ) => (
    <div className={cl(styles.tableCard)} aria-label={ariaLabel}>
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
