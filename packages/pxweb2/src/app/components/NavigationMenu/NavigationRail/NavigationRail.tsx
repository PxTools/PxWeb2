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
  hasFocus: 'filter' | 'view' | 'edit' | 'save' | 'help' | 'none';
}
export const NavigationRail: React.FC<NavigationRailProps> = ({
  onChange,
  selected,
  hasFocus,
}) => {
  const { t } = useTranslation();

  const filterRef = React.useRef<HTMLButtonElement>(null);
  const viewRef = React.useRef<HTMLButtonElement>(null);
  const editRef = React.useRef<HTMLButtonElement>(null);
  const saveRef = React.useRef<HTMLButtonElement>(null);
  const helpRef = React.useRef<HTMLButtonElement>(null);

  /*   React.useEffect(() => {
    if (hasFocus === 'filter') {
      filterRef.current?.focus();
    } else if (hasFocus === 'view') {
      viewRef.current?.focus();
    } else if (hasFocus === 'edit') {
      editRef.current?.focus();
    } else if (hasFocus === 'save') {
      saveRef.current?.focus();
    } else if (hasFocus === 'help') {
      helpRef.current?.focus();
    }
  }, [hasFocus, selected]); */
  return (
    <div className={styles.navigationRail}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <Item
            ref={filterRef}
            parentName="navRail"
            label={t('presentation_page.sidemenu.selection.title')}
            selected={selected === 'filter'}
            icon={'Controls'}
            onClick={(event: any) => {
              if (event.screenX === 0 && event.screenY === 0) {
                onChange(true, selected === 'filter', 'filter');
              } else {
                onChange(false, selected === 'filter', 'filter');
              }
            }}
          />
          <Item
            ref={viewRef}
            parentName="navRail"
            label={t('presentation_page.sidemenu.view.title')}
            selected={selected === 'view'}
            icon={'BarChart'}
            onClick={(event: any) => {
              if (event.screenX === 0 && event.screenY === 0) {
                onChange(true, selected === 'view', 'view');
              } else {
                onChange(false, selected === 'view', 'view');
              }
            }}
          />
          <Item
            ref={editRef}
            parentName="navRail"
            label={t('presentation_page.sidemenu.edit.title')}
            selected={selected === 'edit'}
            icon={'ArrowsUpDown'}
            onClick={(event: any) => {
              if (event.screenX === 0 && event.screenY === 0) {
                onChange(true, selected === 'edit', 'edit');
              } else {
                onChange(false, selected === 'edit', 'edit');
              }
            }}
          />
          <Item
            ref={saveRef}
            parentName="navRail"
            label={t('presentation_page.sidemenu.save.title')}
            selected={selected === 'save'}
            icon={'FloppyDisk'}
            onClick={(event: any) => {
              if (event.screenX === 0 && event.screenY === 0) {
                onChange(true, selected === 'save', 'save');
              } else {
                onChange(false, selected === 'save', 'save');
              }
            }}
          />
          <Item
            ref={helpRef}
            parentName="navRail"
            label={t('presentation_page.sidemenu.help.title')}
            selected={selected === 'help'}
            icon={'QuestionMarkCircle'}
            onClick={(event: any) => {
              if (event.screenX === 0 && event.screenY === 0) {
                onChange(true, selected === 'help', 'help');
              } else {
                onChange(false, selected === 'help', 'help');
              }
            }}
          />
        </MotionConfig>
      </LazyMotion>
    </div>
  );
};

export default NavigationRail;
