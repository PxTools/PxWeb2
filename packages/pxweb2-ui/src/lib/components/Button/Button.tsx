import cl from 'clsx';

import classes from './Button.module.scss';
import { Icon, IconProps } from '../Icon/Icon';

/* eslint-disable-next-line */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium';
  variant: 'primary' | 'secondary' | 'tertiary';
  icon?: IconProps['iconName'];
  iconPosition?: 'left' | 'right';
  className?: string;
  children?: string;
}

export function Button({
  icon,
  iconPosition = 'left',
  variant,
  size = 'medium',
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <button
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
      {icon && iconPosition === 'left' && (
        <Icon iconName={icon} className=""></Icon>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <Icon iconName={icon} className=""></Icon>
      )}
    </button>
  );
}

export default Button;
