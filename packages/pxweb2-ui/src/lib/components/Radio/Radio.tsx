import cl from 'clsx';
import React, { useCallback } from 'react';

import classes from './Radio.module.scss';

export type SelectOption = {
  label: string;
  value: string;
};

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'inModal';
  name: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedOption?: string;
}

export function Radio({
  variant = 'default',
  name,
  options,
  onChange,
  selectedOption,
}: RadioProps) {
  // Focus the selected radio button when the component mounts
  const radioButtonRef = useCallback(
    (radioButton: HTMLInputElement | null) => {
      if (radioButton && radioButton.value === selectedOption) {
        radioButton.focus();
      }
    },
    [selectedOption],
  );

  return (
    <div className={cl(classes.radioGroup)}>
      {options.map((option) => (
        <label
          className={cl(classes.container, classes[`bodyshort-medium`])}
          key={option.value}
        >
          <div className={cl(classes[variant], classes.divider)}>
            <input
              className={cl(classes[variant])}
              type="radio"
              id={option.value}
              name={name}
              value={option.value}
              key={option.value}
              onChange={onChange}
              checked={option.value === selectedOption}
              tabIndex={option.value === selectedOption ? 0 : undefined}
              ref={radioButtonRef}
            />
            {option.label}
          </div>
        </label>
      ))}
    </div>
  );
}

export default Radio;
