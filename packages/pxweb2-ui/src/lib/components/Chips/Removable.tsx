import React from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import styles from './Chips.module.scss';

export interface ChipRemovableProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  filled?: boolean;
  truncate?: boolean;
  ref?: React.Ref<HTMLButtonElement>;
}

export const ChipRemovable = ({
  children,
  filled,
  truncate,
  ref,
  ...rest
}: ChipRemovableProps) => {
  return (
    <button
      {...rest}
      ref={ref}
      className={cl(styles.chip, styles.removable, {
        [styles.filled]: filled,
      })}
      title={truncate ? children : undefined}
    >
      <span
        className={cl(styles.text, styles['label-medium'], {
          [styles.truncate]: truncate,
        })}
      >
        {children}
      </span>
      <Icon className={cl(styles['xmark-icon'])} iconName="XMark" />
    </button>
  );
};

export default ChipRemovable;
