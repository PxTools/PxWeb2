import React from 'react';
import cl from 'clsx';
import styles from './NavigationDrawer.module.scss';
import { Heading, Icon, Label } from '@pxweb2/pxweb2-ui';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

export interface NavigationDrawerProps {
  children: React.ReactNode;
  heading: string;
  view: 'filter' | 'view' | 'edit' | 'save' | 'help';
  onClose: (str: 'filter' | 'view' | 'edit' | 'save' | 'help') => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  children,
  heading,
  view,
  onClose,
}) => {
  const { t } = useTranslation();

  // Handle RTL languages
  const hideIcon = i18next.dir() === 'rtl' ? 'ChevronRight' : 'ChevronLeft';

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      onClose(view);

      console.log('initiator: ', children);
    }
  }

  return (
    <>
      <div onClick={() => onClose(view)} className={styles.backdrop}></div>
      <div className={cl(styles.navigationDrawer, styles.fadein)}>
        <div className={styles.heading}>
          <Heading level="2" size="medium">
            {heading}
          </Heading>
          <div
            tabIndex={0}
            onClick={() => onClose(view)}
            onKeyDown={handleKeyDown}
            className={cl(styles.hideMenu, styles.clickable)}
          >
            <div className={styles.hideIconWrapper}>
              <Icon iconName={hideIcon} className=""></Icon>
            </div>
            <Label size="medium" className={styles.clickable}>
              {t('presentation_page.sidemenu.hide')}
            </Label>
          </div>
        </div>
        <div className={styles.children}>{children}</div>
      </div>
    </>
  );
};
export default NavigationDrawer;
