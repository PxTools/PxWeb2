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
    navRailFilter: HTMLButtonElement;
    navRailView: HTMLButtonElement;
    navRailEdit: HTMLButtonElement;
    navRailSave: HTMLButtonElement;
    navRailHelp: HTMLButtonElement;
  },
  NavigationRailProps
>(({ onChange, selected }, ref) => {
  const { t } = useTranslation();
  const refs = {
    navRailFilter: React.useRef<HTMLButtonElement>(null),
    navRailView: React.useRef<HTMLButtonElement>(null),
    navRailEdit: React.useRef<HTMLButtonElement>(null),
    navRailSave: React.useRef<HTMLButtonElement>(null),
    navRailHelp: React.useRef<HTMLButtonElement>(null),
  };

  React.useImperativeHandle(ref, () => ({
    navRailFilter: refs.navRailFilter.current!,
    navRailView: refs.navRailView.current!,
    navRailEdit: refs.navRailEdit.current!,
    navRailSave: refs.navRailSave.current!,
    navRailHelp: refs.navRailHelp.current!,
  }));

  const isKeyboardClick = (event: any) => {
    return event.screenX === 0 && event.screenY === 0;
  };

  return (
    <div className={styles.navigationRail}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <Item
            ref={refs.navRailFilter}
            parentName="navRail"
            label={t('presentation_page.sidemenu.selection.title')}
            selected={selected === 'filter'}
            icon={'Controls'}
            onClick={(event: any) => {
              onChange(isKeyboardClick(event), selected === 'filter', 'filter');
            }}
          />
          <Item
            ref={refs.navRailView}
            parentName="navRail"
            label={t('presentation_page.sidemenu.view.title')}
            selected={selected === 'view'}
            icon={'BarChart'}
            onClick={(event: any) => {
              onChange(isKeyboardClick(event), selected === 'view', 'view');
            }}
          />
          <Item
            ref={refs.navRailEdit}
            parentName="navRail"
            label={t('presentation_page.sidemenu.edit.title')}
            selected={selected === 'edit'}
            icon={'ArrowsUpDown'}
            onClick={(event: any) => {
              onChange(isKeyboardClick(event), selected === 'edit', 'edit');
            }}
          />
          <Item
            ref={refs.navRailSave}
            parentName="navRail"
            label={t('presentation_page.sidemenu.save.title')}
            selected={selected === 'save'}
            icon={'FloppyDisk'}
            onClick={(event: any) => {
              onChange(isKeyboardClick(event), selected === 'save', 'save');
            }}
          />
          <Item
            ref={refs.navRailHelp}
            parentName="navRail"
            label={t('presentation_page.sidemenu.help.title')}
            selected={selected === 'help'}
            icon={'QuestionMarkCircle'}
            onClick={(event: any) => {
              onChange(isKeyboardClick(event), selected === 'help', 'help');
            }}
          />
        </MotionConfig>
      </LazyMotion>
    </div>
  );
});

export default NavigationRail;
