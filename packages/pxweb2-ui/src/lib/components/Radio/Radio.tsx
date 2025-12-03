import cl from 'clsx';
import React, { forwardRef } from 'react';

import classes from './Radio.module.scss';
import { CheckCircleIcon } from '../CheckCircle/CheckCircleIcon';

export type RadioOption = {
  label: string;
  value: string;
};

export interface RadioProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'inModal';
  name: string;
  options: RadioOption[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedOption?: string;
  legend: string;
  hideLegend?: boolean;
  visual?: 'default' | 'checkCircle';
}

export const Radio = forwardRef<HTMLInputElement, Readonly<RadioProps>>(
  (
    {
      variant = 'default',
      visual = 'default',
      name,
      options,
      onChange,
      selectedOption,
      legend,
      hideLegend = true,
    },
    ref,
  ) => {
    const isCheckCircle = visual === 'checkCircle';
    return (
      <fieldset className={cl(classes.fieldset)}>
        <legend
          className={cl(classes.legend, classes['heading-xsmall'], {
            [classes['inModal']]: variant === 'inModal',
            [classes.legendSrOnly]: hideLegend,
          })}
        >
          {legend}
        </legend>
        <div className={cl(classes.radioGroup)}>
          {options.map((option) => (
            <label
              className={cl(classes.container, classes[`bodyshort-medium`], {
                [classes.checkCircle]: isCheckCircle,
              })}
              key={option.value}
            >
              <div
                className={cl(classes[variant], classes.divider, {
                  [classes.checkCircle]: isCheckCircle,
                })}
              >
                <input
                  className={cl(classes[variant], {
                    [classes.checkCircle]: isCheckCircle,
                  })}
                  type="radio"
                  id={option.value}
                  name={name}
                  value={option.value}
                  key={option.value}
                  onChange={onChange}
                  checked={option.value === selectedOption}
                  ref={option.value === selectedOption ? ref : null}
                />
                {isCheckCircle && (
                  <CheckCircleIcon checked={option.value === selectedOption} />
                )}
                {option.label}
              </div>
            </label>
          ))}
        </div>
      </fieldset>
    );
  },
);

export default Radio;
