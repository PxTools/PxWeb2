import React from 'react';
import cl from 'clsx';
import styles from './NavigationDrawer.module.scss';
import { Button, Heading } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';

export interface NavigationDrawerProps {
  children: React.ReactNode;
  heading: string;
  onClose: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  children,
  heading,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <>
    <div className={styles.backdrop}></div>
    <div className={styles.navigationDrawer}>
      <div className={styles.heading}>
        <Heading level="2" size="small">
          {heading}
        </Heading>
        <Button variant="tertiary" onClick={onClose} icon="ChevronLeft">
          {t('presentation_page.sidemenu.hide')}
        </Button>
      </div>
      <div>{children}</div>
    </div>
    </>
  );
};
export default NavigationDrawer;
