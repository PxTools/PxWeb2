// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import { Button } from '@pxweb2/pxweb2-ui';

function test() { alert('test'); }

export function App() {
  return (
    <>
      <h1>Welcome to pxweb2!</h1>

      <Button iconOnly={false} variant="primary" isDisabled={false} onClick={test}>Button</Button>
      <Button iconOnly={false} variant="primary" isDisabled={true} onClick={test}>Button</Button>
      <Button iconOnly={true} variant="primary" icon="Pencil" onClick={test}></Button>
      <Button iconOnly={true} variant="primary" icon="ChevronUp" onClick={test} size="small" ></Button>

      <Button iconOnly={false} variant="secondary" isDisabled={false} onClick={test}>Button</Button>
      <Button iconOnly={false} variant="secondary" isDisabled={true} onClick={test}>Button</Button>
      <Button iconOnly={true} variant="secondary" icon="Pencil" onClick={test}></Button>
      <Button iconOnly={true} variant="secondary" icon="ChevronUp" onClick={test} size="small" ></Button>

      <Button iconOnly={false} variant="tertiary" isDisabled={false} onClick={test}>Button</Button>
      <Button iconOnly={false} variant="tertiary" isDisabled={true} onClick={test}>Button</Button>
      <Button iconOnly={true} variant="tertiary" icon="Pencil" onClick={test}></Button>
      <Button iconOnly={true} variant="tertiary" icon="ChevronUp" onClick={test} size="small" ></Button>
    </>
  );
}

export default App;
