import React, { forwardRef } from 'react';
import {
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';
import cl from 'clsx';
import classes from '$ui/src/lib/components/Link/Link.module.scss';
import { Icon, IconProps } from '@pxweb2/pxweb2-ui';

interface NavlinkProps extends Omit<RouterNavLinkProps, 'to'> {
  to: string;
  size?: 'small' | 'medium';
  icon?: IconProps['iconName'];
  iconPosition?: 'start' | 'end';
  children: React.ReactNode;
  inline?: boolean;
  noUnderline?: boolean;
}

export const Navlink = forwardRef<HTMLAnchorElement, NavlinkProps>(
  function Navlink(
    {
      children,
      to,
      size,
      icon,
      iconPosition,
      inline = false,
      noUnderline = false,
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <RouterNavLink
        to={to}
        className={({ isActive }) =>
          cl(
            classes.link,
            {
              [classes.no_underline]: noUnderline,
              [classes.inline]: inline,
              [classes[`bodyshort-${size}`]]: size,
              [classes[`padding-${size}`]]: size,
              [classes.active]: isActive,
            },
            className,
          )
        }
        ref={ref}
        {...rest}
      >
        {icon && iconPosition === 'start' && (
          <Icon iconName={icon} className={cl(classes.icon)} />
        )}
        {children}
        {icon && iconPosition === 'end' && (
          <Icon iconName={icon} className={cl(classes.icon)} />
        )}
      </RouterNavLink>
    );
  },
);

export default Navlink;
