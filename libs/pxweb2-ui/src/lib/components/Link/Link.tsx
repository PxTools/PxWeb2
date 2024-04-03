import React from 'react';
import cl from 'clsx';

import classes from './Link.module.scss';
import { Icon, IconProps } from '../Icon/Icon';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: 'small' | 'medium';
  icon?: IconProps['iconName'];
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  href: string;
  inline?: boolean;
  noUnderline?: boolean;
}
export function Link({
  children,
  size,
  href,
  icon,
  iconPosition,
  inline = false,
  noUnderline = false,
  ...rest
}: LinkProps) {
  return (
    <a
      href={href}
      className={cl(classes.link, {
        [classes.no_underline]: noUnderline,
        [classes.inline]: inline,
        [classes[`bodylong-${size}`]]: size,
        [classes[`padding-${size}`]]: size,
      })}
    >
      {icon && iconPosition === 'left' && (
        <Icon iconName={icon} className=""></Icon>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <Icon iconName={icon} className=""></Icon>
      )}
    </a>
  );
}
export default Link;
