import React, { forwardRef } from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import styles from './Chips.module.scss';

export interface ChipRemovableProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  filled?: boolean;
}

export const ChipRemovable = forwardRef<HTMLButtonElement, ChipRemovableProps>(
  ({ children, filled, ...rest }, ref) => {
    return (
      <button
        {...rest}
        ref={ref}
        className={cl(styles.chip, styles.removable, {
          [styles.filled]: filled,
        })}
      >
        <span className={cl(styles.text, styles['label-medium'])}>
          {children}
        </span>
        <Icon iconName="XMark" />
      </button>
    );
  },
);

export default ChipRemovable;
