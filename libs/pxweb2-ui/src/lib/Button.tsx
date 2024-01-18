import styles from './Button.module.scss';

/* eslint-disable-next-line */
export interface ButtonProps {
  /*size:'Small'|'Medium',*/
  /*variant:'Primary'|'Secondary'|'Tertiary',*/
  label:string
}

export function Button({label}: ButtonProps) {
  return (
    <button className={styles['container']} >
      {label}
    </button>
  );
}

export default Button;
