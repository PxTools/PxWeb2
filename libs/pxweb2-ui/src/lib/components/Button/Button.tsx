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
  children?: string;
}

export function Button({
  icon,
  iconPosition = 'left',
  variant,
  size = 'medium',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cl(
        classes.button,
        classes[size],
        classes[`label-${size}`],
        classes[variant],
        {
          [classes.iconOnlyMedium]: !children && icon && size === 'medium',
        },
        {
          [classes.iconOnlySmall]: !children && icon && size === 'small',
        }
      )}
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
