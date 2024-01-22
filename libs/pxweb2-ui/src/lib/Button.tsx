import styles from './Button.module.scss';
import Pencil from './Icons/Pencil';
// export type IconType = {
//   Icon:'Pencil'|'ChevronUp'
//  }

/* eslint-disable-next-line */
export interface ButtonProps {
  /*size:'Small'|'Medium',*/
  /*variant:'Primary'|'Secondary'|'Tertiary',*/
    label:string,
    iconOnly:boolean
    icon:'Pencil'|'ChevronUp'    
}

export function Button({label,iconOnly,icon}: ButtonProps) {
  return (
    <button className={styles['button']} disabled={false}  >
      {icon && <Pencil color='white'></Pencil>}
      {!iconOnly && label}
    </button>
  );
}

export default Button;
