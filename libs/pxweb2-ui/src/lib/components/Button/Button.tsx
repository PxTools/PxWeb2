import cl from 'clsx';
import classes from './Button.module.scss';
import { Icon, IconProps } from '../Icon/Icon';

/* eslint-disable-next-line */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'small' | 'medium';
  variant: 'primary' | 'secondary' | 'tertiary';
  icon?: IconProps['iconName'];
  children?: string;
}

export function Button({
  icon,
  variant,
  size = 'medium',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cl(classes.button, classes[size], classes[variant], {
        [classes.iconOnly]: !children && icon,
      })}
      {...rest}
    >
      {icon && <Icon iconName={icon}></Icon>}
      {children}
    </button>
  );
}

export default Button;
