import React from 'react';
import styles from './NavigationBar.module.scss';
import { useTranslation } from 'react-i18next';
import { Item } from '../NavigationRail/NavigationRail';

export const NavigationBar: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.navigationBar}>
      <Item
        label={t('presentation_page.sidemenu.selection.title')}
        selected={true}
        icon={'Controls'}
      />
      <Item
        label={t('presentation_page.sidemenu.view.title')}
        selected={false}
        icon={'BarChart'}
      />
      <Item
        label={t('presentation_page.sidemenu.edit.title')}
        selected={false}
        icon={'ArrowsUpDown'}
      />
      <Item
        label={t('presentation_page.sidemenu.save.title')}
        selected={false}
        icon={'FloppyDisk'}
      />
      <Item
        label={t('presentation_page.sidemenu.help.title')}
        selected={false}
        icon={'QuestionMarkCircle'}
      />
    </div>
  );
};
export default NavigationBar;
