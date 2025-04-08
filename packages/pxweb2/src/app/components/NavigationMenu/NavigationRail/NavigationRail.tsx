import React from 'react';
import { useTranslation } from 'react-i18next';
import { LazyMotion, MotionConfig } from 'motion/react';

import styles from './NavigationRail.module.scss';
import { NavigationItem } from '../NavigationItem/NavigationItemType';
import { Item } from '../NavigationItem/NavigationItem';

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
    filter: HTMLButtonElement;
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
    filter: refs.filter.current!,
    view: refs.view.current!,
    edit: refs.edit.current!,
    save: refs.save.current!,
    help: refs.help.current!,
  }));

  const refs = {
    save: React.useRef<HTMLButtonElement>(null),
    help: React.useRef<HTMLButtonElement>(null),
    filter: React.useRef<HTMLButtonElement>(null),
    view: React.useRef<HTMLButtonElement>(null),
    edit: React.useRef<HTMLButtonElement>(null),
  };

  return (
    <div className={styles.navigationRail}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <nav
            aria-label={t('presentation_page.sidemenu.arialabeltoolsidemenu')}
          >
            <ul className={styles.navigationRailList}>
              <Item
                ref={refs.filter}
                parentName="navRail"
                label={t('presentation_page.sidemenu.selection.title')}
                selected={selected === 'filter'}
                icon={'Controls'}
                onClick={(event) => {
                  onChange(
                    isKeyboardClick(event),
                    selected === 'filter',
                    'filter',
                  );
                }}
              />
              <Item
                ref={refs.view}
                parentName="navRail"
                label={t('presentation_page.sidemenu.view.title')}
                selected={selected === 'view'}
                icon={'BarChart'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'view', 'view');
                }}
              />
              <Item
                ref={refs.edit}
                parentName="navRail"
                label={t('presentation_page.sidemenu.edit.title')}
                selected={selected === 'edit'}
                icon={'ArrowsUpDown'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'edit', 'edit');
                }}
              />
              <Item
                ref={refs.save}
                parentName="navRail"
                label={t('presentation_page.sidemenu.save.title')}
                selected={selected === 'save'}
                icon={'Download'}
                onClick={(event) => {
                  onChange(isKeyboardClick(event), selected === 'save', 'save');
                }}
              />
              <Item
                ref={refs.help}
                parentName="navRail"
                label={t('presentation_page.sidemenu.help.title')}
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
