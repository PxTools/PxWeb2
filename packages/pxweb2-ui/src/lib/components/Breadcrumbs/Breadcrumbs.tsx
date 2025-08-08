import React, { forwardRef, useRef, useEffect, useState } from 'react';
import cl from 'clsx';

import styles from './Breadcrumbs.module.scss';
import { Icon } from '../Icon/Icon';
import Button from '../Button/Button';

interface BreadcrumbsProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'compact';
  children?: React.ReactNode;
}

export const Breadcrumbs = forwardRef<HTMLAnchorElement, BreadcrumbsProps>(
  function Breadcrumbs({ children, variant = 'default' }: BreadcrumbsProps) {
    const ulRef = useRef<HTMLUListElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [showMore, setShowMore] = useState(true); // <-- Add this state

    useEffect(() => {
      const checkOverflow = () => {
        if (ulRef.current) {
         setIsOverflowing(ulRef.current.scrollWidth > ulRef.current.clientWidth);
        }
      };
      checkOverflow();
      window.addEventListener('resize', checkOverflow);
      return () => window.removeEventListener('resize', checkOverflow);
    }, [children]);

    return (
      <>
        <div
          className={cl(
            styles.breadcrumbsContainer,
            variant && styles[variant],
          )}
        >
          <ul
            ref={ulRef}
            className={cl(
              styles.breadcrumbsWrapper,
              variant && styles[variant],
            )}
          >
            {React.Children.toArray(children).map((child, idx) => (

  <li key={idx} className={cl(styles.breadcrumbItem)}>
      {child}
      <Icon
        iconName="ChevronRight"
        className={cl(styles.breadcrumbItemIcon)}
      />
    </li>
              // <React.Fragment key={idx}>
              //   <div
              //     className={cl(styles.breadcrumbItem)}
              //   >
              //     {child}
              //     <Icon
              //       iconName="ChevronRight"
              //       className={cl(styles.breadcrumbItemIcon)}
              //     />
              //   </div>
              // </React.Fragment>
            ))}
          </ul>
          {variant === 'compact' && isOverflowing && showMore && (
            <Button
              variant="tertiary"
              className={cl(styles.showMoreButton)}
              onClick={() => setShowMore(false)}
             >
              Show more
            </Button>
          )}
        </div>
      </>
    );
  },
);
export default Breadcrumbs;
