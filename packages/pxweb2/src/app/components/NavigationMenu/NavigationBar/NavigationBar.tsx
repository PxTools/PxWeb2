import React from 'react';
import { useTranslation } from 'react-i18next';
import { LazyMotion, MotionConfig } from 'motion/react';

import styles from './NavigationBar.module.scss';
import { NavigationItem } from '../NavigationItem/NavigationItemType';
import { Item } from '../NavigationItem/NavigationItem';

// Lazy load the animation features
const loadFeatures = () =>
  import('../../../util/animationFeatures').then((res) => res.default);

interface NavigationBarProps {
  selected: NavigationItem;
  onChange: (
    keyboard: boolean,
    close: boolean,
    newSelected: NavigationItem,
  ) => void;
}

export const NavigationBar = React.forwardRef<
  {
    filter: HTMLButtonElement;
    view: HTMLButtonElement;
    edit: HTMLButtonElement;
    save: HTMLButtonElement;
    help: HTMLButtonElement;
  },
  NavigationBarProps
>(({ selected, onChange }, ref) => {
  const { t } = useTranslation();
  const refs = {
    filter: React.useRef<HTMLButtonElement>(null),
    view: React.useRef<HTMLButtonElement>(null),
    edit: React.useRef<HTMLButtonElement>(null),
    save: React.useRef<HTMLButtonElement>(null),
    help: React.useRef<HTMLButtonElement>(null),
  };

  React.useImperativeHandle(ref, () => ({
    filter: refs.filter.current!,
    view: refs.view.current!,
    edit: refs.edit.current!,
    save: refs.save.current!,
    help: refs.help.current!,
  }));

  return (
    <div className={styles.navigationBar}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <ul className={styles.navigationBarList}>
            <Item
              ref={refs.filter}
              parentName="navBar"
              label={t('presentation_page.sidemenu.selection.title')}
              selected={selected === 'filter'}
              icon={'Controls'}
              onClick={(event: any) => {
                onChange(
                  event.screenX === 0 && event.screenY === 0,
                  selected === 'filter',
                  'filter',
                );
              }}
            />
            <Item
              ref={refs.view}
              parentName="navBar"
              label={t('presentation_page.sidemenu.view.title')}
              selected={selected === 'view'}
              icon={'BarChart'}
              onClick={(event: any) => {
                onChange(
                  event.screenX === 0 && event.screenY === 0,
                  selected === 'view',
                  'view',
                );
              }}
            />
            <Item
              ref={refs.edit}
              parentName="navBar"
              label={t('presentation_page.sidemenu.edit.title')}
              selected={selected === 'edit'}
              icon={'ArrowsUpDown'}
              onClick={(event: any) => {
                onChange(
                  event.screenX === 0 && event.screenY === 0,
                  selected === 'edit',
                  'edit',
                );
              }}
            />
            <Item
              ref={refs.save}
              parentName="navBar"
              label={t('presentation_page.sidemenu.save.title')}
              selected={selected === 'save'}
              icon={'FloppyDisk'}
              onClick={(event: any) => {
                onChange(
                  event.screenX === 0 && event.screenY === 0,
                  selected === 'save',
                  'save',
                );
              }}
            />
            <Item
              ref={refs.help}
              parentName="navBar"
              label={t('presentation_page.sidemenu.help.title')}
              selected={selected === 'help'}
              icon={'QuestionMarkCircle'}
              onClick={(event: any) => {
                onChange(
                  event.screenX === 0 && event.screenY === 0,
                  selected === 'help',
                  'help',
                );
              }}
            />
          </ul>
        </MotionConfig>
      </LazyMotion>
    </div>
  );
});

export default NavigationBar;
