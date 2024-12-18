import { useTranslation } from 'react-i18next';
import { LazyMotion, MotionConfig } from 'motion/react';

import styles from './NavigationRail.module.scss';
import { NavigationItem } from '../NavigationItem/NavigationItemType';
import { Item } from '../NavigationItem/NavigationItem';
import React from 'react';

// Lazy load the animation features
const loadFeatures = () =>
  import('../../../util/animationFeatures').then((res) => res.default);

interface NavigationRailProps {
  selected: NavigationItem;
  onChange: (newSelected: NavigationItem) => void;
  focus: "filter" | "view" | "edit" | "save" | "help" | "none";
}
export const NavigationRail: React.FC<NavigationRailProps> = ({
  onChange,
  selected,
  focus,
}) => {
  const { t } = useTranslation();

  // Create refs for each navigation item
  const refs = {
    filter: React.useRef<HTMLButtonElement>(null),
    view: React.useRef<HTMLButtonElement>(null),
    edit: React.useRef<HTMLButtonElement>(null),
    save: React.useRef<HTMLButtonElement>(null),
    help: React.useRef<HTMLButtonElement>(null),
  };

  React.useEffect(() => {
    console.log("focus: ", focus)
    if (focus !== 'none') {
      console.log("SET FOCUS ON: ", focus)
      refs[focus]?.current?.focus();
    }
  }, [focus, refs]);

  return (
    <div className={styles.navigationRail}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <Item
            parentName="navRail"
            label={t('presentation_page.sidemenu.selection.title')}
            selected={selected === 'filter'}
            icon={'Controls'}
            onClick={() => onChange('filter')}
            ref={refs.filter}
          />
          <Item
            parentName="navRail"
            label={t('presentation_page.sidemenu.view.title')}
            selected={selected === 'view'}
            icon={'BarChart'}
            onClick={() => onChange('view')}
            ref={refs.view}
          />
          <Item
            parentName="navRail"
            label={t('presentation_page.sidemenu.edit.title')}
            selected={selected === 'edit'}
            icon={'ArrowsUpDown'}
            onClick={() => onChange('edit')}
            ref={refs.edit}
          />
          <Item
            parentName="navRail"
            label={t('presentation_page.sidemenu.save.title')}
            selected={selected === 'save'}
            icon={'FloppyDisk'}
            onClick={() => onChange('save')}
            ref={refs.save}
          />
          <Item
            parentName="navRail"
            label={t('presentation_page.sidemenu.help.title')}
            selected={selected === 'help'}
            icon={'QuestionMarkCircle'}
            onClick={() => onChange('help')}
            ref={refs.help}
          />
        </MotionConfig>
      </LazyMotion>
    </div>
  );
};

export default NavigationRail;
