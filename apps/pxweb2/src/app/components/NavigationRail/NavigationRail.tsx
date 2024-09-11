import React from 'react';
import cl from 'clsx';
import styles from './NavigationRail.module.scss';
import { useTranslation } from 'react-i18next';
import { Icon, IconProps, Label } from '@pxweb2/pxweb2-ui';
import { NavigationItem } from '../../components/Pages/TableView/TableView';

interface ItemProps {
  label: string;
  selected: boolean;
  icon: IconProps['iconName'];
  onClick: () => void;
}
export const Item: React.FC<ItemProps> = ({
  label,
  selected,
  icon,
  onClick,
}) => {
  return (
    <button className={styles.item} onClick={onClick}>
      <div className={cl(styles.icon, { [styles.selected]: selected })}>
        <Icon iconName={icon} />
      </div>
      <div>
        <Label>{label}</Label>
      </div>
    </button>
  );
};

interface NavigationRailProps {
  selected: NavigationItem;
  onChange: (newSelected: NavigationItem) => void;
}
export const NavigationRail: React.FC<NavigationRailProps> = ({
  onChange,
  selected,
}) => {
  const { t } = useTranslation();

  return (
    <div className={styles.navigationRail}>
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
export default NavigationRail;
