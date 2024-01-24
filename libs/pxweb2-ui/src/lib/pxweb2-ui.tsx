import styles from './pxweb2-ui.module.scss';
import Button from './Button';

/* eslint-disable-next-line */
export interface Pxweb2UiProps {
  title: string;
}

function test() { alert('test'); } 

export function Pxweb2Ui(props: Pxweb2UiProps) {
  const title = props.title || 'Welcome to pxweb2-ui!';

  return (
    <div className={styles['container']}>
      <h1>{title}</h1>
      <Button iconOnly={false} variant="primary" isDisabled={true} onClick={test}>
        Button
      </Button>
      <Button iconOnly={true} icon="Pencil" variant="primary" onClick={test}>
        Knapp 2
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="primary" onClick={test}>
        Knapp 3
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="primary" isDisabled={true} onClick={test}>
        Knapp 3
      </Button>

      <br />

      <Button iconOnly={false} variant="secondary" onClick={test}>
        Button
      </Button>
      <Button iconOnly={true} icon="Pencil" variant="secondary" onClick={test}>
        Knapp 2
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="secondary" onClick={test}>
        Knapp 3
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="secondary" isDisabled={true} onClick={test}>
        Knapp 3
      </Button>

      <br />

      <Button iconOnly={false} variant="tertiary" onClick={test}>
        Button
      </Button>
      <Button iconOnly={true} icon="Pencil" variant="tertiary" onClick={test}>
        Knapp 2
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="tertiary" onClick={test}>
        Knapp 3
      </Button>
      <Button size="small" iconOnly={true} icon="Pencil" variant="tertiary" isDisabled={true} onClick={test}>
        Knapp 3
      </Button>
    </div>
  );
}

export default Pxweb2Ui;
