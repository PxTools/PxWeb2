import React, { forwardRef } from 'react';
import cl from 'clsx';

import styles from './Breadcrumbs.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import Button from '../Button/Button';

interface BreadcrumbsProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'compact';
  dividerIcon?: IconProps['iconName'];
  target?: '_blank' | '_self' | '_parent' | '_top';
  children?: React.ReactNode;
}

export const Breadcrumbs = forwardRef<HTMLAnchorElement, BreadcrumbsProps>(
  function Breadcrumbs({ children, variant = 'default' }: BreadcrumbsProps) {
    return (<>
    <div className={cl(styles.breadcrumbsContainer, variant && styles[variant])} style={{ display: 'flex', alignItems: 'center' }}>
      <ul className={cl(styles.breadcrumbsWrapper, variant && styles[variant])} style={{ display: 'flex', alignItems: 'center', margin: 0, padding: 0 }}>
        {React.Children.toArray(children).map((child, idx) => (
          <React.Fragment key={idx}>
            <div className={cl(styles.breadcrumbItem)} style={{ display: 'flex', alignItems: 'center' }}>
              {child}
              <Icon iconName="ChevronRight" className={cl(styles.breadcrumbItemIcon)} />
            </div>
          </React.Fragment>
        ))}
      </ul>
      {variant === 'compact' && (
        <Button variant='tertiary' className={cl(styles.showMoreButton)} style={{ marginLeft: '8px' }}>
          Show more
        </Button>
      )}
    </div>
    </>
    );
  },
);
export default Breadcrumbs;
