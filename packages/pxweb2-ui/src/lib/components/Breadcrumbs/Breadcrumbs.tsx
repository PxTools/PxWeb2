import React, { forwardRef, useRef, useEffect, useState } from 'react';
import cl from 'clsx';
import styles from './Breadcrumbs.module.scss';
import { BreadcrumbsIcon } from '../Icon/BreadcrumbsIcon';
import Button from '../Button/Button';
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
        <div
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
            {breadcrumbItems.map((item) => (
              <li key={item.href} className={cl(styles.breadcrumbItem)}>
                <div
                  className={cl(
                    styles.breadcrumbItemLink,
                    variant && styles[variant],
                  )}
                >
                  <Link size="medium" inline href={item.href}>
                    {item.label}
                  </Link>
                </div>
                <div className={cl(styles.breadcrumbItemIconWrapper)}>
                  <BreadcrumbsIcon className={cl(styles.breadcrumbItemIcon)} />
                </div>
              </li>
            ))}
          </ul>
          {variant === 'compact' && isOverflowing && !showMore && (
            <span className={styles.dots}>{dots}</span>
          )}
          {variant === 'compact' && isOverflowing && !showMore && (
            <Button
              variant="tertiary"
              className={cl(styles.showMoreButton)}
              onClick={() => setShowMore(true)}
            >
              Show more
            </Button>
          )}
        </div>
    );
  },
);
export default Breadcrumbs;
