import { type ReactNode, forwardRef, KeyboardEvent, MouseEvent } from 'react';
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
  onNavigate?: () => void;
  period?: string;
  status?: 'active' | 'closed';
  tableId?: string;
  title?: string;
  updatedLabel?: string;
  tabIndex?: number;
}

export const TableCard = forwardRef<HTMLElement, TableCardProps>(
  (
    {
      ariaLabel,
      frequency,
      href,
      icon,
      lastUpdated,
      onNavigate,
      period,
      status = 'active',
      tableId,
      title,
      updatedLabel,
      tabIndex,
    },
    ref,
  ) => {
    const noTextSelected = () => !window.getSelection()?.toString();

    const handleActionClick = () => {
      if (noTextSelected() && typeof href === 'function') {
        href();
      }
    };

    const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
      if (!noTextSelected()) {
        event.preventDefault();
        return;
      }

      const isPlainLeftClick =
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.shiftKey &&
        !event.altKey;

      if (isPlainLeftClick && onNavigate) {
        event.preventDefault();
        onNavigate();
      }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (typeof href === 'string') {
          if (noTextSelected()) {
            if (onNavigate) {
              onNavigate();
            } else {
              window.location.href = href;
            }
          }
          return;
        }

        handleActionClick();
      }
    };

    const content = (
      <>
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
      </>
    );

    if (typeof href === 'string') {
      return (
        <a
          className={cl(styles.tableCard)}
          aria-label={ariaLabel}
          href={href}
          onClick={handleLinkClick}
          onKeyDown={handleKeyDown}
          ref={ref as React.Ref<HTMLAnchorElement>}
          tabIndex={tabIndex ?? 0}
        >
          {content}
        </a>
      );
    }

    return (
      <div
        className={cl(styles.tableCard)}
        role="link"
        aria-label={ariaLabel}
        onClick={handleActionClick}
        onKeyDown={handleKeyDown}
        ref={ref as React.Ref<HTMLDivElement>}
        tabIndex={tabIndex ?? 0}
      >
        {content}
      </div>
    );
  },
);

export default TableCard;
