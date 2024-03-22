import cl from 'clsx';
import classes from './Search.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import{Label} from '../Typography/Label/Label';
import {Button, ButtonProps} from '../Button/Button';
import React, { useState } from 'react';


export interface SearchProps 
extends React.InputHTMLAttributes <HTMLInputElement> {
  variant: 'default' | 'inVariableBox' ;
  labelText?: string;
  searchPlaceHolder?: string;
  searchIcon?: IconProps['iconName']; 
  showClearButton?: boolean;
  clearButton?: ButtonProps['icon'];      
}

export function Search({
  searchIcon = "MagnifyingGlass",
  variant,
  labelText,
  searchPlaceHolder,  
  showClearButton = false,
  clearButton = "XMark",      
  ...rest
}: SearchProps) { 
  const [inputValue, setInputValue] = useState('');
  const handleClear = () => {
    setInputValue('');
  };
   const hasValue = inputValue.length > 0;
  return (
    <div className={classes.search}>
      {labelText && <Label size='medium'>{labelText}</Label>}
      <div className={cl(classes.wrapper, classes.border, classes[variant])}>
        <Icon iconName={searchIcon} className={classes.searchIcon} ></Icon>
        <input type='text'
          className={cl(classes.input, classes[variant])}
          placeholder={searchPlaceHolder}           
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          {...rest}
        ></input>
        {hasValue && (
          <Button 
            variant={"tertiary"} 
            icon={clearButton}  
            size={'small'} 
            className={classes.clearButton}
            onClick={handleClear}
          ></Button>
        )}      
      </div>
    </div>
  );
}

export default Search;


