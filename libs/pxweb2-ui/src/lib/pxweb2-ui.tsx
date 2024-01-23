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
      <Button iconOnly={false} variant="primary" isDisabled={true}>
        Button
      </Button>
      <Button iconOnly={true} icon="Pencil" variant="primary">
        Knapp 2
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="primary">
        Knapp 3
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="primary" isDisabled={true}>
        Knapp 3
      </Button>

      <br />

      <Button iconOnly={false} variant="secondary">
        Button
      </Button>
      <Button iconOnly={true} icon="Pencil" variant="secondary">
        Knapp 2
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="secondary">
        Knapp 3
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="secondary" isDisabled={true}>
        Knapp 3
      </Button>

      <br />

      <Button iconOnly={false} variant="tertiary">
        Button
      </Button>
      <Button iconOnly={true} icon="Pencil" variant="tertiary">
        Knapp 2
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="tertiary">
        Knapp 3
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="tertiary" isDisabled={true}>
        Knapp 3
      </Button>
    </div>
  );
}

export default Pxweb2Ui;
