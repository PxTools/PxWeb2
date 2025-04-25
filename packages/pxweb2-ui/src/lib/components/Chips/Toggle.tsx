import React, { forwardRef } from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import styles from './Chips.module.scss';

export interface ChipToggleProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  selected?: boolean;
  checkmark?: boolean;
}

export const ChipToggle = forwardRef<HTMLButtonElement, ChipToggleProps>(
  ({ children, selected, checkmark = true, ...rest }, ref) => {
    return (
      <button
        {...rest}
        ref={ref}
        className={cl(
          styles.chip,
          styles.toggle,
          {
            [styles.selected]: selected,
          },
          {
            [styles.withoutCheckmark]: !checkmark,
          },
        )}
        aria-pressed={selected}
      >
        {selected && checkmark && <Icon iconName="Check" />}
        <span className={cl(styles.text, styles['label-medium'])}>
          {children}
        </span>
      </button>
    );
  },
);

export default ChipToggle;
