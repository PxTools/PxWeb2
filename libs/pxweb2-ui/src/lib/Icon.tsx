import styles from './Icon.module.scss';

/* eslint-disable-next-line */
export interface IconProps {
  icon: string;
}

export function Icon(props: IconProps) {
  return (
    <span className={styles['container']}>
      <h1>Welcome to Icon!</h1>
    </span>
  );
}

export default Icon;
