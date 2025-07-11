import React, { HTMLAttributes } from 'react';
import cl from 'clsx';

import { OverridableComponent } from '../../util/OverridableComponent';
import ChipRemovable, { ChipRemovableProps } from './Removable';
import ChipToggle, { ChipToggleProps } from './Toggle';
import styles from './Chips.module.scss';

export interface ChipsProps extends HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
  type?: 'removable' | 'toggle';
  ref?: React.Ref<HTMLUListElement>;
}

interface ChipsComponent extends React.FC<ChipsProps> {
  Toggle: OverridableComponent<ChipToggleProps, HTMLButtonElement>;
  Removable: OverridableComponent<ChipRemovableProps, HTMLButtonElement>;
}

export const Chips: ChipsComponent = ({
  children,
  ref,
  ...rest
}: ChipsProps) => {
  return (
    <ul {...rest} ref={ref} className={cl(styles.chips)}>
      {React.Children.toArray(children)
        .filter(Boolean)
        .map((chip, index) => (
          <li key={React.isValidElement(chip) && chip.key ? chip.key : index}>
            {chip}
          </li>
        ))}
    </ul>
  );
};

Chips.Toggle = ChipToggle;
Chips.Removable = ChipRemovable;

export default Chips;
