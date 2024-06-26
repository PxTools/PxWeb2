import React from 'react';
import styles from './NavigationBar.module.scss';
import { useTranslation } from 'react-i18next';
import { Item } from '../NavigationRail/NavigationRail';
import { NavigationItem } from '../../app';

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
      <Item
        label={t('presentation_page.sidemenu.selection.title')}
        selected={selected === 'filter'}
        icon={'Controls'}
        onClick={() => {
          onChange('filter');
        }}
      />
      <Item
        label={t('presentation_page.sidemenu.view.title')}
        selected={selected === 'view'}
        icon={'BarChart'}
        onClick={() => {
          onChange('view');
        }}
      />
      <Item
        label={t('presentation_page.sidemenu.edit.title')}
        selected={selected === 'edit'}
        icon={'ArrowsUpDown'}
        onClick={() => {
          onChange('edit');
        }}
      />
      <Item
        label={t('presentation_page.sidemenu.save.title')}
        selected={selected === 'save'}
        icon={'FloppyDisk'}
        onClick={() => {
          onChange('save');
        }}
      />
      <Item
        label={t('presentation_page.sidemenu.help.title')}
        selected={selected === 'help'}
        icon={'QuestionMarkCircle'}
        onClick={() => {
          onChange('help');
        }}
      />
    </div>
  );
};
export default NavigationBar;
