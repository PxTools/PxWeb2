import styles from './Button.module.scss';

/* eslint-disable-next-line */
export interface ButtonProps {
  /*size:'Small'|'Medium',*/
  /*variant:'Primary'|'Secondary'|'Tertiary',*/
    label:string,
    iconOnly:boolean    
}

export function Button({label,iconOnly}: ButtonProps) {
  return (
    <button className={styles['button']} disabled={false}  >
       {!iconOnly && label}
    </button>
  );
}

export default Button;
