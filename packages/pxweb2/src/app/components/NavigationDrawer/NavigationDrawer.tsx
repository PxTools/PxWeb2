import React, { forwardRef } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import styles from './NavigationDrawer.module.scss';
import { Heading, Icon, getIconDirection, Label } from '@pxweb2/pxweb2-ui';
import i18next from 'i18next';
import useAccessibility from '../../context/useAccessibility';
import useApp from '../../context/useApp';

export interface NavigationDrawerProps {
  children: React.ReactNode;
  heading: string;
  view: 'filter' | 'view' | 'edit' | 'save' | 'help';
  openedWithKeyboard: boolean;
  onClose: (
    keyboard: boolean,
    str: 'filter' | 'view' | 'edit' | 'save' | 'help',
  ) => void;
}

export const NavigationDrawer = forwardRef<
  HTMLDivElement,
  NavigationDrawerProps
>(({ children, heading, view, openedWithKeyboard, onClose }, ref) => {
  const { t } = useTranslation();
  const { addModal, removeModal } = useAccessibility();
  const { skipToMainFocused } = useApp();

  React.useEffect(() => {
    addModal('NavigationDrawer', () => {
      onClose(true, view);
    });

    return () => {
      removeModal('NavigationDrawer');
    };
  }, [addModal, removeModal, onClose, view]);

  // Handle RTL languages for the icon
  const hideIcon = getIconDirection(
    i18next.dir(),
    'ChevronLeft',
    'ChevronRight',
  );

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); // Prevent scrolling with space

      onClose(true, view);
    }
  }
  React.useEffect(() => {
    if (
      document.activeElement !== document.body &&
      ref &&
      typeof ref !== 'function'
    ) {
      ref.current?.focus();
    }
  }, [view, ref]);

  React.useEffect(() => {
    if (openedWithKeyboard && ref && typeof ref !== 'function') {
      ref.current?.focus();
    }
  }, [openedWithKeyboard, ref]);

  return (
    <>
      <div
        onClick={() => onClose(false, view)}
        className={styles.backdrop}
      ></div>
      <div
        className={cl(styles.navigationDrawer, styles.fadein, {
          [styles.skipToMainContentVisible]: skipToMainFocused,
        })}
        role="region"
        aria-label={heading}
      >
        <div className={styles.heading}>
          <Heading level="2" size="medium">
            {heading}
          </Heading>
          <div
            ref={ref}
            tabIndex={0}
            onClick={() => onClose(false, view)}
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
});

export default NavigationDrawer;
