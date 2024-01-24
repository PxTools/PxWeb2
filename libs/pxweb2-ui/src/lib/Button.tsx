import cl from 'clsx';
import classes from './Button.module.scss';
import Icon, { IconType } from './Icon';

/* eslint-disable-next-line */
export interface ButtonProps {
  size?: 'small' | 'medium';
  variant: 'primary' | 'secondary' | 'tertiary';
  iconOnly: boolean;
  icon?: IconType;
  children?: string;
  isDisabled?: boolean;
  onClick: () => void;
}

export function Button({
  iconOnly,
  icon,
  variant,
  size = 'medium',
  children,
  isDisabled = false,
  onClick,
}: ButtonProps) {

   return (
    <button className={cl(
      classes.button,
      classes[size],
      classes[variant],
      {[classes.iconOnly]: iconOnly}
    )}
     disabled={isDisabled} onClick={onClick}>
      {icon && <Icon icon={icon}></Icon>}
      {!iconOnly && children}
    </button>
  );
}

export default Button;
