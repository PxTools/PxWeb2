import React from 'react';
import cl from 'clsx';

import styles from './NavigationRail.module.scss';
import { Icon, IconProps, Label } from '@pxweb2/pxweb2-ui';

interface ItemProps {
  label: string;
  selected: boolean;
  icon: IconProps['iconName'];
}
const Item: React.FC<ItemProps> = ({ label, selected, icon }) => {
  return (
    <div className={styles.item}>
      <div className={cl(styles.icon, { [styles.selected]: selected })}>
        <Icon iconName={icon} />
      </div>
      <div>
        <Label>{label}</Label>
      </div>
    </div>
  );
};

export const NavigationRail: React.FC = () => {
  return (
    <div className={styles.navigationRail}>
      <Item label="Filtrer" selected={true} icon={'Controls'} />
      <Item label="Visning" selected={false} icon={'BarChart'} />
      <Item label="Rediger" selected={false} icon={'ArrowsUpDown'} />
      <Item label="Lagre" selected={false} icon={'FloppyDisk'} />
      <Item label="Hjelp" selected={false} icon={'QuestionMarkCircle'} />
    </div>
  );
};
export default NavigationRail;
