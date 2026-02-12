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
    selection: React.RefObject<HTMLButtonElement | null>;
    view: React.RefObject<HTMLButtonElement | null>;
    edit: React.RefObject<HTMLButtonElement | null>;
    save: React.RefObject<HTMLButtonElement | null>;
    help: React.RefObject<HTMLButtonElement | null>;
  },
  NavigationRailProps
>(({ onChange, selected }, ref) => {
  const { t } = useTranslation();

  const isKeyboardClick = (event: React.MouseEvent<HTMLElement>) => {
    return event.screenX === 0 && event.screenY === 0;
  };

  const selectionRef = React.useRef<HTMLButtonElement>(null);
  const viewRef = React.useRef<HTMLButtonElement>(null);
  const editRef = React.useRef<HTMLButtonElement>(null);
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const helpRef = React.useRef<HTMLButtonElement>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      selection: selectionRef,
      view: viewRef,
      edit: editRef,
      save: saveRef,
      help: helpRef,
    }),
    [],
  );

  return (
    <div className={styles.navigationRail}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <nav aria-labelledby="navRailHeading">
            <Heading
              level={'2'}
              className={cl(styles['sr-only'])}
              id="navRailHeading"
            >
              {t('presentation_page.side_menu.aria_label_tool_side_menu')}
            </Heading>
            <ul
              className={styles.navigationRailList}
              aria-labelledby="navRailHeading"
            >
              <Item
                ref={selectionRef}
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
                ref={viewRef}
                parentName="navRail"
                label={t('presentation_page.side_menu.view.title')}
                selected={selected === 'view'}
                icon={'BarChart'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'view', 'view');
                }}
              />
              <Item
                ref={editRef}
                parentName="navRail"
                label={t('presentation_page.side_menu.edit.title')}
                selected={selected === 'edit'}
                icon={'ArrowsUpDown'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'edit', 'edit');
                }}
              />
              <Item
                ref={saveRef}
                parentName="navRail"
                label={t('presentation_page.side_menu.save.title')}
                selected={selected === 'save'}
                icon={'Download'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'save', 'save');
                }}
              />
              <Item
                ref={helpRef}
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
