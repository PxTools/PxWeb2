import styles from './pxweb2-ui.module.scss';

/* eslint-disable-next-line */
export interface Pxweb2UiProps {
  title: string;
  variant: 'primary' | 'secondary';
}

export function Pxweb2Ui(props: Pxweb2UiProps) {
  const title = props.title || 'Welcome to pxweb2-ui!';

  return (
    <div className={styles['container']}>
      <h1>{title}</h1>
      {props.variant === 'primary' && (
        <button className={styles['button']}>Primary</button>
      )}
    </div>
  );
}

export default Pxweb2Ui;
