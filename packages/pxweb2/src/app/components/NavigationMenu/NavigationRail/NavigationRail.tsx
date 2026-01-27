import React from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { LazyMotion, MotionConfig } from 'motion/react';

import styles from './NavigationRail.module.scss';
import { NavigationItem } from '../NavigationItem/NavigationItemType';
import { Item } from '../NavigationItem/NavigationItem';
import { Heading } from '@pxweb2/pxweb2-ui';

// Lazy load the animation features
const loadFeatures = () =>
  import('../../../util/animationFeatures').then((res) => res.default);

interface NavigationRailProps {
  selected: NavigationItem;
  onChange: (
    keyboard: boolean,
    close: boolean,
    newSelected: NavigationItem,
  ) => void;
}

export const NavigationRail = React.forwardRef<
  {
    selection: HTMLButtonElement;
    view: HTMLButtonElement;
    edit: HTMLButtonElement;
    save: HTMLButtonElement;
    help: HTMLButtonElement;
  },
  NavigationRailProps
>(({ onChange, selected }, ref) => {
  const { t } = useTranslation();

  const isKeyboardClick = (event: React.MouseEvent<HTMLElement>) => {
    return event.screenX === 0 && event.screenY === 0;
  };

  React.useImperativeHandle(ref, () => ({
    selection: refs.selection.current!,
    view: refs.view.current!,
    edit: refs.edit.current!,
    save: refs.save.current!,
    help: refs.help.current!,
  }));

  const refs = {
    save: React.useRef<HTMLButtonElement>(null),
    help: React.useRef<HTMLButtonElement>(null),
    selection: React.useRef<HTMLButtonElement>(null),
    view: React.useRef<HTMLButtonElement>(null),
    edit: React.useRef<HTMLButtonElement>(null),
  };

  return (
    <div className={styles.navigationRail}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <nav
            aria-label={t(
              'presentation_page.side_menu.aria_label_tool_side_menu',
            )}
          >
            <Heading level={'2'} className={cl(styles['sr-only'])}>
              {t('presentation_page.side_menu.aria_label_tool_side_menu')}
            </Heading>
            <ul className={styles.navigationRailList}>
              <Item
                ref={refs.selection}
                parentName="navRail"
                label={t('presentation_page.side_menu.selection.title')}
                selected={selected === 'selection'}
                icon={'Controls'}
                onClick={(event) => {
                  onChange(
                    isKeyboardClick(event),
                    selected === 'selection',
                    'selection',
                  );
                }}
              />
              <Item
                ref={refs.view}
                parentName="navRail"
                label={t('presentation_page.side_menu.view.title')}
                selected={selected === 'view'}
                icon={'BarChart'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'view', 'view');
                }}
              />
              <Item
                ref={refs.edit}
                parentName="navRail"
                label={t('presentation_page.side_menu.edit.title')}
                selected={selected === 'edit'}
                icon={'ArrowsUpDown'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'edit', 'edit');
                }}
              />
              <Item
                ref={refs.save}
                parentName="navRail"
                label={t('presentation_page.side_menu.save.title')}
                selected={selected === 'save'}
                icon={'Download'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'save', 'save');
                }}
              />
              <Item
                ref={refs.help}
                parentName="navRail"
                label={t('presentation_page.side_menu.help.title')}
                selected={selected === 'help'}
                icon={'QuestionMarkCircle'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'help', 'help');
                }}
              />
            </ul>
          </nav>
        </MotionConfig>
      </LazyMotion>
    </div>
  );
});

export default NavigationRail;
