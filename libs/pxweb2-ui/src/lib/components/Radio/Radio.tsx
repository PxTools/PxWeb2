import classes from './Radio.module.scss';
import cl from 'clsx';
import React from "react";

export type SelectOption = {
  label: string;
  value: string;  
};

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Radio({
  name,
  options,
  onChange, 
}: RadioProps) {
  return (
    <div className={cl(classes.radioGroup)}>
      {options.map((option) => (      
        <label className={cl(classes.container)} key={option.value}>
          {option.label}
          <div className={cl(classes.divider)}>
            <input
              type="radio"
              id={option.value}
              name={name}
              value={option.value}
              key={option.value}
              onChange={onChange}
            />
            <span className={cl(classes.checkmark)}></span>            
          </div>   
        </label>    
      ))}
    </div>
  );
}

export default Radio;