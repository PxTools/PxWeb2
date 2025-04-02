import cl from 'clsx';

import styles from './Information.module.scss';

export const Information = () => {
  return (
    <div className={styles.information}>
      <div className={cl(styles['heading-large'])}>Statistikkbanken</div>
      <p className={cl(styles['bodyshort-medium'])}>
        Her finner du alle tallene våre samlet på ett sted. Bruk søk og
        filtrering for å finne tabellene du trenger. På grunn av
        personvernhensyn kan ikke tabellene kombineres. Oppdatering av
        Statistikkbanken skjer hver dag klokken 08:00.
      </p>
    </div>
  );
};
