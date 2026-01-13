import React, { useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import cl from 'clsx';

import styles from './Breadcrumbs.module.scss';
import { BreadcrumbsIcon } from '../Icon/BreadcrumbsIcon';
import Link from '../Link/Link';

interface BreadcrumbsProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly variant?: 'default' | 'compact';
  readonly breadcrumbItems: BreadcrumbItem[];
}

export class BreadcrumbItem {
  label: string;
  href: string;

  constructor(label: string, href: string) {
    this.label = label;
    this.href = href;
  }
}

export function Breadcrumbs({
  breadcrumbItems,
  variant = 'default',
}: BreadcrumbsProps) {
  const ulRef = useRef<HTMLUListElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const dots = '...';
  const { t } = useTranslation();

  useEffect(() => {
    const checkOverflow = () => {
      if (ulRef.current) {
        setIsOverflowing(ulRef.current.scrollWidth > ulRef.current.clientWidth);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);

    return () => window.removeEventListener('resize', checkOverflow);
  }, []);

  return (
    <nav
      aria-label={t('common.breadcrumbs.aria_label_breadcrumb')}
      className={cl(
        styles.breadcrumbsContainer,
        variant && styles[variant],
        showMore && styles.showMore,
      )}
    >
      <ul
        ref={ulRef}
        className={cl(
          styles.breadcrumbsWrapper,
          variant && styles[variant],
          showMore && styles.showMore,
        )}
      >
        {breadcrumbItems.map((item, idx) => {
          const isLast = idx === breadcrumbItems.length - 1;

          return (
            <li
              key={item.href}
              className={cl(
                styles.breadcrumbItem,
                variant && styles[variant],
                showMore && styles.showMore,
              )}
            >
              <Link
                className={cl(
                  styles.breadcrumbItemLink,
                  variant && styles[variant],
                  styles['bodyshort-medium'],
                  showMore && styles.showMore,
                )}
                size="medium"
                inline
                href={item.href}
                {...(isLast ? { 'aria-current': 'page' } : {})}
              >
                {item.label}
              </Link>

              <BreadcrumbsIcon
                aria-hidden="true"
                className={cl(
                  styles.breadcrumbItemIcon,
                  variant && styles[variant],
                  i18next.dir() === 'rtl' ? styles.rtl : styles.ltr,
                )}
              />
            </li>
          );
        })}
      </ul>

      {variant === 'compact' && isOverflowing && !showMore && (
        <span className={styles.compactActions}>
          <span className={styles.dots}>{dots}</span>
          <input
            type="button"
            className={cl(styles.showMoreText)}
            value={t('common.breadcrumbs.show_more_breadcrumbs')}
            onClick={() => setShowMore(true)}
            aria-label="Show more breadcrumbs"
          />
        </span>
      )}
    </nav>
  );
}

export default Breadcrumbs;
