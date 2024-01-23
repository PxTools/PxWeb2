import styles from './Button.module.scss';
import Icon from './Icon';
import Pencil from './Icons/Pencil';

type IconType = 'Pencil' | 'ChevronUp';

/* eslint-disable-next-line */
export interface ButtonProps {
  size?:'small'|'medium',
  variant: 'primary' | 'secondary' | 'tertiary';
  iconOnly: boolean;
  icon?: IconType;
  children?: string;
  isDisabled?: boolean;
}

export function Button({ iconOnly, icon, variant, size="medium", children, isDisabled=false }: ButtonProps) {
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
    <button className={styling} disabled={isDisabled}>
      {icon && <Pencil variant={variant}></Pencil>}
      {/* {icon && <Icon icon={icon}></Icon>} */}
      {!iconOnly && children}
    </button>
  );
}

export default Button;
