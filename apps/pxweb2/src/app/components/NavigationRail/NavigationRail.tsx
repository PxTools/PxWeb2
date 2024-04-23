import React from 'react';
import cl from 'clsx';
import styles from './NavigationRail.module.scss';
import { useTranslation } from 'react-i18next';
import { Icon, IconProps, Label } from '@pxweb2/pxweb2-ui';

interface ItemProps {
  label: string;
  selected: boolean;
  icon: IconProps['iconName'];
}
export const Item: React.FC<ItemProps> = ({ label, selected, icon }) => {
  return (
    <button className={styles.item}>
      <div className={cl(styles.icon, { [styles.selected]: selected })}>
        <Icon iconName={icon} />
      </div>
      <div>
        <Label>{label}</Label>
      </div>
    </button>
  );
};

export const NavigationRail: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.navigationRail}>
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
export default NavigationRail;
