import classes from './Radio.module.scss';
import cl from 'clsx';
import React from "react";
import Label from '../Typography/Label/Label';

export type SelectOption = {
  label: string;
  value: string;
  number?: number;
};

export interface RadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  children: React.ReactNode;
  options: SelectOption[];
  selectedOption?: SelectOption;
}

export function Radio({
     name,
     options,
     selectedOption,     
}: RadioProps) {
  const [clickedItem, setClickedItem] = React.useState<SelectOption | undefined>(
    selectedOption
  );
  return (
    <div className={cl(classes.radioGroup)}>
      {options.map((option) => (      
    <label className={cl(classes.container)} key={option.value}>{option.label}
      <div className={cl(classes.divider)}>
      <input
        type="radio"
        id={option.value}
        name={name}
        value={option.value}
        key={option.value}
        checked={option.value === clickedItem?.value}
        onChange={() => {
              setClickedItem(option);
         }}
      />
      <span className={cl(classes.checkmark)}></span>            
      </div>   
    </label>    
  ))}
  </div>
  );
}

export default Radio;