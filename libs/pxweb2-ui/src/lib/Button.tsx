import styles from './Button.module.scss';
import Pencil from './Icons/Pencil';

type IconType = 'Pencil' | 'ChevronUp';

/* eslint-disable-next-line */
export interface ButtonProps {
  /*size:'Small'|'Medium',*/
  variant: 'primary' | 'secondary' | 'tertiary';
  label: string;
  iconOnly: boolean;
  icon: IconType;
}

export function Button({ label, iconOnly, icon, variant }: ButtonProps) {
  let styling = styles['button'];

  if (variant) {
    styling += ' ' + styles[variant];
  }
  if (iconOnly) {
    styling += ' ' + styles['iconOnly'];
  }

  return (
    <button className={styling} disabled={false}>
      {icon && <Pencil variant={variant}></Pencil>}
      {!iconOnly && label}
    </button>
  );
}

export default Button;
