import cl from 'clsx';

import styles from './CheckCircle.module.scss';
import { Icon } from '../Icon/Icon';

export interface CheckCircleIconProps {
  checked: boolean;
}

export const CheckCircleIcon = ({
  checked,
}: Readonly<CheckCircleIconProps>) => {
  return (
    <span
      className={cl(styles.iconWrapper, {
        [styles['checked']]: checked,
      })}
    >
      {checked && (
        <Icon iconName="CheckCircle" className={styles.iconChecked}></Icon>
      )}
    </span>
  );
};
