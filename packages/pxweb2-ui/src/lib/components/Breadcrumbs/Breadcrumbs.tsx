import React, { forwardRef, useRef, useEffect, useState } from 'react';
import cl from 'clsx';
import styles from './Breadcrumbs.module.scss';
import { BreadcrumbsIcon } from '../Icon/BreadcrumbsIcon';
import Link from '../Link/Link';

interface BreadcrumbsProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'compact';
  breadcrumbItems: BreadcrumbItem[];
}

export class BreadcrumbItem {
  label: string;
  href: string;

  constructor(label: string, href: string) {
    this.label = label;
    this.href = href;
  }
}

export const Breadcrumbs = forwardRef<HTMLAnchorElement, BreadcrumbsProps>(
  function Breadcrumbs({
    breadcrumbItems,
    variant = 'default',
  }: BreadcrumbsProps) {
    const ulRef = useRef<HTMLUListElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const dots = '...';

    useEffect(() => {
      const checkOverflow = () => {
        if (ulRef.current) {
          setIsOverflowing(
            ulRef.current.scrollWidth > ulRef.current.clientWidth,
          );
        }
      };
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, []);

    return (
      <nav
        aria-label="Breadcrumbs"
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
                  className={cl(
                    styles.breadcrumbItemIcon,
                    variant && styles[variant],
                  )}
                />
              </li>
            );
          })}
        </ul>
        {variant === 'compact' && isOverflowing && !showMore && (
          <span className={styles.compactActions}>
          <span className={styles.dots}>{dots}</span>
          <span
            className={cl(styles.showMoreText)}
            role="button"
            tabIndex={0}
            onClick={() => setShowMore(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowMore(true);
              }
            }}
            aria-label="Show more breadcrumbs"
          >
            Show more
          </span>
          </span>
        )}
      </nav>
    );
  },
);
export default Breadcrumbs;
