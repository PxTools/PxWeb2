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
  iconPosition?: 'left' | 'right';
  className?: string;
  children?: string;
  loading?: boolean;
  loadingLabel?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      icon,
      iconPosition = 'left',
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
          ) + cssClasses
        }
        {...rest}
      >
        {loading ? (
          <Spinner
            size="xsmall"
            variant={variant === 'tertiary' ? 'default' : 'inverted'}
            label={loadingLabel ?? undefined}
          />
        ) : (
          <>
            {icon && iconPosition === 'left' && <Icon iconName={icon} />}
            {children}
            {icon && iconPosition === 'right' && <Icon iconName={icon} />}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
