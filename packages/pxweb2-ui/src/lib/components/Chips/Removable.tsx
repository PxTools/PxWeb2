import React, { forwardRef } from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import styles from './Chips.module.scss';

export interface ChipRemovableProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: string;
  variant?: 'border' | 'filled';
  onClick?: () => void;
}

export const ChipRemovable = forwardRef<HTMLButtonElement, ChipRemovableProps>(
  ({ children, variant = 'border', onClick, ...rest }, ref) => {
    return (
      <button
        {...rest}
        ref={ref}
        className={cl(styles.chip, styles.removable, styles[variant])}
        onClick={onClick}
      >
        <span className={cl(styles.text)}>{children}</span>
        <span className={cl(styles.emovableIcon)}>
          <Icon iconName="XMark" />
        </span>
      </button>
    );
  },
);

export default ChipRemovable;
