// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.scss';

import { Pxweb2Ui } from "@pxweb2/pxweb2-ui";

import NxWelcome from './nx-welcome';

export function App() {
  return (
    <div>
      <NxWelcome title="pxweb2" />
      <Pxweb2Ui />
    </div>
  );
}

export default App;
