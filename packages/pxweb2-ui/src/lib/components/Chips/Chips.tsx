import React, { HTMLAttributes, forwardRef } from 'react';
import cl from 'clsx';
import { OverridableComponent } from '../../util/OverridableComponent';
import ChipRemovable, { ChipRemovableProps } from './Removable';
import ChipToggle, { ChipToggleProps } from './Toogle';
import styles from './Chips.module.scss';

export interface ChipsProps extends HTMLAttributes<HTMLUListElement> {
  children: React.ReactNode;
  type?: 'removable' | 'toggle';
}

interface ChipsComponent
  extends React.ForwardRefExoticComponent<
    ChipsProps & React.RefAttributes<HTMLUListElement>
  > {
  Toggle: OverridableComponent<ChipToggleProps, HTMLButtonElement>;
  Removable: OverridableComponent<ChipRemovableProps, HTMLButtonElement>;
}

export const Chips: ChipsComponent = forwardRef<HTMLUListElement, ChipsProps>(
  ({ children, ...rest }, ref) => {
    return (
      <ul {...rest} ref={ref} className={cl(styles.chips)}>
        {React.Children.map(children, (chip) => {
          return <li>{chip}</li>;
        })}
      </ul>
    );
  },
) as ChipsComponent;

Chips.Toggle = ChipToggle;
Chips.Removable = ChipRemovable;

export default Chips;
