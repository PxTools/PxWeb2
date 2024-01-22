import styles from './pxweb2-ui.module.scss';
import Button from './Button';

/* eslint-disable-next-line */
export interface Pxweb2UiProps {
  title: string;
}

export function Pxweb2Ui(props: Pxweb2UiProps) {
  const title = props.title || 'Welcome to pxweb2-ui!';

  return (
    <div className={styles['container']}>
      <h1>{title}</h1>
      <Button
        iconOnly={true}
        label="Knapp"
        icon="Pencil"
        variant="primary"
      ></Button>
      <Button
        iconOnly={true}
        label="Knapp 2"
        icon="Pencil"
        variant="secondary"
      ></Button>
    </div>
  );
}

export default Pxweb2Ui;
