import styles from './Button.module.scss';
import Icon from './Icon';
import Pencil from './Icons/Pencil';

type IconType = 'Pencil' | 'ChevronUp';

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
  let styling = styles['button'];

  if (variant) {
    styling += ' ' + styles[variant];
  }
  if (size) {
    styling += ' ' + styles[size];
  }
  if (iconOnly) {
    styling += ' ' + styles['iconOnly'];
  }

  return (
    <button className={styling} disabled={isDisabled} onClick={onClick}>
      {icon && <Pencil></Pencil>}
      {/* {icon && <Icon icon={icon}></Icon>} */}
      {!iconOnly && children}
    </button>
  );
}

export default Button;
