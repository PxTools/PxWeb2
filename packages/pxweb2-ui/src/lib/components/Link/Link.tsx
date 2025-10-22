import React, { forwardRef } from 'react';
import cl from 'clsx';

import classes from './Link.module.scss';
import { Icon, IconProps } from '../Icon/Icon';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  size?: 'small' | 'medium';
  icon?: IconProps['iconName'];
  iconPosition?: 'left' | 'right';
  target?: '_blank' | '_self' | '_parent' | '_top';
  children: React.ReactNode;
  href: string;
  inline?: boolean;
  noUnderline?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  {
    children,
    size,
    href,
    target,
    icon,
    iconPosition,
    inline = false,
    noUnderline = false,
    ...rest
  }: LinkProps,
  ref,
) {
  return (
    <a
      href={href}
      target={target ? target : ''}
      className={cl(classes.link, {
        [classes.no_underline]: noUnderline,
        [classes.inline]: inline,
        [classes[`bodyshort-${size}`]]: size,
        [classes[`padding-${size}`]]: size,
      })}
      ref={ref}
      {...rest}
    >
      {icon && iconPosition === 'left' && (
        <Icon iconName={icon} className={cl(classes.icon)}></Icon>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <Icon iconName={icon} className={cl(classes.icon)}></Icon>
      )}
    </a>
  );
});
export default Link;
