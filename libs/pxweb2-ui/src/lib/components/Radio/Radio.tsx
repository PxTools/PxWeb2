import classes from './Radio.module.scss';
import cl from 'clsx';
import React from "react";

export type SelectOption = {
  label: string;
  value: string;  
};

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  return (
    <div className={cl(classes.radioGroup)} >
      {options.map((option) => (      
        <label className={cl(classes.container,  classes[`bodyshort-medium`],)} key={option.value}>
          <div className={cl(classes[variant],classes.divider)}>
            <input
              className={cl(classes[variant])}
              type="radio"
              id={option.value}
              name={name}
              value={option.value}
              key={option.value}
              onChange={onChange}
              checked={option.value === selectedOption}              
            />{option.label}
          </div>   
        </label>    
      ))}
    </div>
  );
}

export default Radio;
