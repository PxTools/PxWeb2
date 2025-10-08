import { type ReactNode, forwardRef, KeyboardEvent } from 'react';
import cl from 'clsx';

import styles from './TableCard.module.scss';
import { Icon } from '../Icon/Icon';
import { Tag } from '../Tag/Tag';
import { Heading } from '../Typography/Heading/Heading';

interface TableCardProps {
  ariaLabel?: string;
  frequency?: string;
  href?: string | (() => void);
  icon?: ReactNode;
  lastUpdated?: string;
  period?: string;
  status?: 'active' | 'closed';
  tableId?: string;
  title?: string;
  updatedLabel?: string;
  tabIndex?: number;
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
      tabIndex,
    },
    ref,
  ) => {
    const handleClick = () => {
      const noTextSelected = !window.getSelection()?.toString();
      if (noTextSelected && href && typeof href === 'string') {
        window.location.href = href;
      } else if (noTextSelected && typeof href === 'function') {
        href();
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        className={cl(styles.tableCard)}
        role="link"
        aria-label={ariaLabel}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        ref={ref}
        tabIndex={tabIndex ?? 0}
      >
        {icon && (
          <div className={cl(styles.iconWrapper, styles[status])}>{icon}</div>
        )}
        <div className={cl(styles.cardContent)}>
          <div className={cl(styles.titleWrapper)}>
            <Heading className={styles.title} level="3" size="small">
              {title}
            </Heading>
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
                  <Tag
                    size="small"
                    variant={status === 'closed' ? 'error-subtle' : 'subtle'}
                  >
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
