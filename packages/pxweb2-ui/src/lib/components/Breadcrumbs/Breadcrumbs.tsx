import React, { forwardRef } from 'react';
import cl from 'clsx';

import styles from './Breadcrumbs.module.scss';
import { Icon, IconProps } from '../Icon/Icon';


interface BreadcrumbsProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  style?: 'default' | 'compact';
  dividerIcon?: IconProps['iconName'];
  target?: '_blank' | '_self' | '_parent' | '_top';
  children: React.ReactNode;
}

export const Breadcrumbs = forwardRef<HTMLAnchorElement, BreadcrumbsProps>(function Breadcrumbs(
  {
    children,
    style = 'default',
  }: BreadcrumbsProps,
  ) {
  return (
    <ul className={cl(styles.breadcrumbs, style && styles[style])}>
      {React.Children.toArray(children).map((child, idx) => (
      <React.Fragment key={idx}>
       <div className={styles.breadcrumbItem}> {child} <Icon iconName="ChevronRight" /></div>
      </React.Fragment>
      ))}
    </ul>

        );
      });
      export default Breadcrumbs;
