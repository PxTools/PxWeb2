import styles from './pxweb2-ui.module.scss';

/* eslint-disable-next-line */
export interface Pxweb2UiProps {}

export function Pxweb2Ui(props: Pxweb2UiProps) {
  return (
    <div className={styles['container']}>
      <h1>Welcome to Pxweb2Ui! Hei alle sammen</h1>
    </div>
  );
}

export default Pxweb2Ui;
