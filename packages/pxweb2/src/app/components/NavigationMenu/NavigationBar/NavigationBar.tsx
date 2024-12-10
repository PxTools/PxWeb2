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
  onChange: (newSelected: NavigationItem) => void;
}
export const NavigationBar: React.FC<NavigationBarProps> = ({
  selected,
  onChange,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.navigationBar}>
      <LazyMotion features={loadFeatures}>
        <MotionConfig reducedMotion="user">
          <Item
            parentName="navBar"
            label={t('presentation_page.sidemenu.selection.title')}
            selected={selected === 'filter'}
            icon={'Controls'}
            onClick={() => {
              onChange('filter');
            }}
          />
          <Item
            parentName="navBar"
            label={t('presentation_page.sidemenu.view.title')}
            selected={selected === 'view'}
            icon={'BarChart'}
            onClick={() => {
              onChange('view');
            }}
          />
          <Item
            parentName="navBar"
            label={t('presentation_page.sidemenu.edit.title')}
            selected={selected === 'edit'}
            icon={'ArrowsUpDown'}
            onClick={() => {
              onChange('edit');
            }}
          />
          <Item
            parentName="navBar"
            label={t('presentation_page.sidemenu.save.title')}
            selected={selected === 'save'}
            icon={'FloppyDisk'}
            onClick={() => {
              onChange('save');
            }}
          />
          <Item
            parentName="navBar"
            label={t('presentation_page.sidemenu.help.title')}
            selected={selected === 'help'}
            icon={'QuestionMarkCircle'}
            onClick={() => {
              onChange('help');
            }}
          />
        </MotionConfig>
      </LazyMotion>
    </div>
  );
};
export default NavigationBar;
