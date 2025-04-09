import { type ReactNode, forwardRef, KeyboardEvent } from 'react';
import cl from 'clsx';

import styles from './TableCard.module.scss';
import { Icon } from '../Icon/Icon';
import { Tag } from '../Tag/Tag';

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

export const TableCard = forwardRef<HTMLDivElement, TableCardProps>(
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
  ) => {
    const handleClick = () => {
      const noTextSelected = !window.getSelection()?.toString();

      if (noTextSelected && href) {
        window.location.href = href;
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        handleClick();
      }
    };

    return (
      <div
        className={cl(styles.tableCard)}
        aria-label={ariaLabel}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={ref}
      >
        {icon && (
          <div className={cl(styles.iconWrapper, styles[status])}>{icon}</div>
        )}
        <div className={cl(styles.cardContent)}>
          <div className={cl(styles.titleWrapper)}>
            <a
              href={href}
              className={cl(styles.title, styles['heading-small'])}
              onClick={(e) => e.stopPropagation()}
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
                <div className={cl(styles.frequency)}>
                  <Tag size="small" variant="subtle">
                    {frequency}
                  </Tag>
                </div>
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
              <Tag size="small" type="border" variant="subtle">
                {tableId}
              </Tag>
            )}
          </div>
        </div>
      </div>
    );
  },
);

export default TableCard;
