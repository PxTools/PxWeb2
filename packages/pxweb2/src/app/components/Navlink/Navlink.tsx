import React, { forwardRef } from 'react';
import {
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
  useInRouterContext,
} from 'react-router-dom';
import cl from 'clsx';
import classes from '$ui/src/lib/components/Link/Link.module.scss';
import { Icon, IconProps, Link as UiLink } from '@pxweb2/pxweb2-ui';

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
    const inRouter = useInRouterContext();

    const commonClassName = cl(
      classes.link,
      {
        [classes.no_underline]: noUnderline,
        [classes.inline]: inline,
        [classes[`bodyshort-${size}`]]: size,
        [classes[`padding-${size}`]]: size,
      },
      className,
    );

    if (!inRouter) {
      // Fallback to regular anchor if no router context (e.g., isolated component tests)
      const { style, ...anchorRest } = rest as Record<string, unknown>;
      const anchorStyle =
        typeof style === 'function'
          ? style({ isActive: false, isPending: false })
          : style;
      return (
        <UiLink
          href={to}
          ref={ref}
          className={commonClassName}
          style={anchorStyle}
          {...anchorRest}
        >
          {icon && iconPosition === 'start' && (
            <Icon iconName={icon} className={cl(classes.icon)} />
          )}
          {children}
          {icon && iconPosition === 'end' && (
            <Icon iconName={icon} className={cl(classes.icon)} />
          )}
        </UiLink>
      );
    }

    return (
      <RouterNavLink
        to={to}
        className={({ isActive }) =>
          cl(commonClassName, { [classes.active]: isActive })
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
