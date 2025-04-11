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
        className={cl(styles.toggle, {
          [styles.selected]: selected,
        })}
      >
        {selected && checkmark && <Icon iconName="CheckMark" />}
        <span className={cl('navds-chips__chip-text')}>{children}</span>
      </button>
    );
  },
);

export default ChipToggle;
