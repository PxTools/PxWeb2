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
  view: 'selection' | 'view' | 'edit' | 'save' | 'help';
  openedWithKeyboard: boolean;
  onClose: (
    keyboard: boolean,
    str: 'selection' | 'view' | 'edit' | 'save' | 'help',
  ) => void;
}

export const NavigationDrawer = forwardRef<
  HTMLButtonElement,
  NavigationDrawerProps
>(({ children, heading, view, openedWithKeyboard, onClose }, ref) => {
  const { t } = useTranslation();
  const { addModal, removeModal } = useAccessibility();
  const { skipToMainFocused } = useApp();
  const isXLargeDesktop = useApp().isXLargeDesktop;
  const isXXLargeDesktop = useApp().isXXLargeDesktop;

  const isLargeScreen = isXXLargeDesktop === true && isXLargeDesktop === true;

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
  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
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

  function getFocusableElements(container: HTMLElement | null) {
    if (!container) {
      return [];
    }
    return Array.from(
      container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'),
    );
  }

  const drawerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isLargeScreen) {
      const handleTabTrap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') {
          return;
        }
        const focusableEls = getFocusableElements(drawerRef.current);
        if (focusableEls.length === 0) {
          return;
        }

        const firstEl = focusableEls[0];
        const lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      };

      drawerRef.current?.addEventListener('keydown', handleTabTrap);
      return () => {
        drawerRef.current?.removeEventListener('keydown', handleTabTrap);
      };
    }
  }, [isLargeScreen]);

  return (
    <>
      <div
        data-testid="drawer-backdrop"
        onClick={() => onClose(false, view)}
        className={styles.backdrop}
      ></div>
      <div
        ref={drawerRef}
        className={cl(styles.navigationDrawer, styles.fadein, {
          [styles.skipToMainContentVisible]: skipToMainFocused,
        })}
        role="region"
        aria-label={heading}
        tabIndex={-1}
      >
        {/* Focus trap sentinels */}
        {!isLargeScreen && (
          <div tabIndex={0} aria-hidden="true" role="presentation" />
        )}
        <div className={styles.heading}>
          <Heading level="2" size="medium">
            {heading}
          </Heading>
          <button
            ref={ref}
            type="button"
            onClick={() => onClose(false, view)}
            onKeyDown={handleKeyDown}
            className={cl(styles.hideMenu, styles.clickable)}
          >
            <span className={styles.hideIconWrapper}>
              <Icon iconName={hideIcon} className="" />
            </span>
            <Label size="medium" className={styles.clickable}>
              {t('presentation_page.side_menu.hide')}
            </Label>
          </button>
        </div>
        {children}
        {!isLargeScreen && (
          <div tabIndex={0} aria-hidden="true" role="presentation" />
        )}
      </div>
    </>
  );
});

export default NavigationDrawer;
