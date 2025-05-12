import cl from 'clsx';

import { Ingress } from '@pxweb2/pxweb2-ui';
import styles from './Information.module.scss';

export const Information = () => {
  return (
    <div className={styles.information}>
      <div className={cl(styles['heading-large'])}>Statistikkbanken</div>
      <Ingress>
        Her finner du alle tallene våre samlet på ett sted. Bruk søk og
        filtrering for å finne tabellene du trenger. På grunn av
        personvernhensyn kan ikke tabellene kombineres. Oppdatering av
        Statistikkbanken skjer hver dag klokken 08:00.
      </Ingress>
    </div>
  );
};
