import React, { forwardRef } from 'react';
import { createPortal } from 'react-dom';
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
  const {
    skipToMainFocused,
    isMobile,
    isTablet,
    isXLargeDesktop,
    isXXLargeDesktop,
  } = useApp();
  const isSmallScreen =
    isMobile === true ||
    isTablet === true ||
    (isXLargeDesktop === false &&
      isXXLargeDesktop === false &&
      isMobile === false &&
      isTablet === false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const headingId = React.useId();

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

  // Trap focus within the drawer on small screens only
  React.useEffect(() => {
    if (!isSmallScreen) {
      return;
    }
    const getFocusable = () => {
      const sel =
        'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
      const node = containerRef.current;
      if (!node) {
        return [] as HTMLElement[];
      }
      const list = Array.from(node.querySelectorAll<HTMLElement>(sel)).filter(
        (el) => el.offsetParent !== null,
      );
      return list as HTMLElement[];
    };

    let focusables = getFocusable();
    let first =
      focusables[0] || (ref && typeof ref !== 'function' ? ref.current : null);
    let last = focusables[focusables.length - 1] || first;

    // Move focus into the drawer before trapping
    const active = document.activeElement as HTMLElement | null;
    const node = containerRef.current;
    if (active && node && !node.contains(active)) {
      active.blur();
    }
    if (first) {
      // Defer to next tick to ensure render
      setTimeout(() => first && first.focus(), 0);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose(true, view);
        return;
      }
      if (e.key !== 'Tab') {
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      if (!first || !last) {
        return;
      }
      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    node?.addEventListener('keydown', handleKeyDown);
    // Global trap to catch Tab presses even if focus escapes
    const handleDocKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') {
        return;
      }
      const inDrawer = node?.contains(document.activeElement as Node) ?? false;
      if (!inDrawer && first) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', handleDocKeyDown, true);

    // Listen for custom event to re-run getFocusable when DrawerHelp is rendered
    const rerunFocus = () => {
      focusables = getFocusable();
      first =
        focusables[0] ||
        (ref && typeof ref !== 'function' ? ref.current : null);
      last = focusables[focusables.length - 1] || first;
      if (first) {
        setTimeout(() => first && first.focus(), 0);
      }
    };
    window.addEventListener('drawer-help-rendered', rerunFocus);

    return () => {
      node?.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleDocKeyDown, true);
      window.removeEventListener('drawer-help-rendered', rerunFocus);
    };
  }, [onClose, view, ref, isSmallScreen]);

  const portalTarget =
    document.querySelector('[data-drawer-root]') ?? document.body;
  return createPortal(
    <>
      {isSmallScreen && (
        <div
          onClick={() => onClose(false, view)}
          className={styles.backdrop}
          aria-hidden="true"
        ></div>
      )}
      <div
        ref={containerRef}
        className={cl(styles.navigationDrawer, styles.fadein, {
          [styles.skipToMainContentVisible]: skipToMainFocused,
        })}
        {...(isSmallScreen
          ? { role: 'dialog', 'aria-modal': 'true' }
          : { role: 'region' })}
        aria-labelledby={headingId}
        data-testid={`${view}-drawer`}
        data-view={view}
      >
        <div className={styles.heading}>
          <Heading id={headingId} level="2" size="medium">
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
      </div>
    </>,
    portalTarget,
  );
});

export default NavigationDrawer;
