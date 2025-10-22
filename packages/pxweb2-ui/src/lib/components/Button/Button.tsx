import React, { forwardRef } from 'react';
import cl from 'clsx';

import classes from './Button.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import { Spinner } from '../Spinner/Spinner';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium';
  variant: 'primary' | 'secondary' | 'tertiary';
  icon?: IconProps['iconName'];
  iconPosition?: 'start' | 'end';
  className?: string;
  children?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      icon,
      iconPosition = 'start',
      variant,
      size = 'medium',
      children,
      className = '',
      loading = false,
      loadingLabel,
      ...rest
    },
    ref,
  ) => {
    const cssClasses = className.length > 0 ? ' ' + className : '';

    return (
      <button
        ref={ref}
        className={
          cl(
            classes.button,
            classes[size],
            classes[`label-${size}`],
            classes[variant],
            {
              [classes.iconOnlyMedium]: !children && icon && size === 'medium',
            },
            {
              [classes.iconOnlySmall]: !children && icon && size === 'small',
            },
            {
              [classes.loading]: loading,
            },
          ) + cssClasses
        }
        aria-disabled={loading || rest.disabled}
        aria-busy={loading || rest.disabled}
        aria-label={loading ? (loadingLabel ?? 'Loading…') : undefined}
        {...rest}
      >
        {loading ? (
          <>
            <Spinner
              size="xsmall"
              variant={variant === 'secondary' ? 'default' : 'inverted'}
              label={loadingLabel ?? undefined}
              aria-hidden="true"
            />
            <span className={classes['sr-only']}>
              {loadingLabel ?? 'Loading…'}
            </span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'start' && (
              <Icon
                iconName={icon}
                className={cl(
                  classes.icon,
                  classes[`icon-${size}`],
                  classes[`icon-color`],
                )}
              />
            )}
            {children}
            {icon && iconPosition === 'end' && (
              <Icon
                iconName={icon}
                className={cl(
                  classes.icon,
                  classes[`icon-${size}`],
                  classes[`icon-color`],
                )}
              />
            )}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
