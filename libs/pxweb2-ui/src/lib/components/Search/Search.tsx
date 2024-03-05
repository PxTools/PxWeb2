import cl from 'clsx';
import classes from './Search.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import{Label} from '../Typography/Label/Label';
import React from 'react';
import {Button, ButtonProps} from '../Button/Button';

export interface SearchProps 
extends React.InputHTMLAttributes <HTMLInputElement> {
  variant: 'default' | 'inVariableBox' ;
  label?: boolean; 
  labelText?: string;
  searchPlaceHolder?: string;
  searchIcon?: IconProps['iconName']; 
  showClearButton?: boolean;
  clearButton?: ButtonProps['icon'];  
}

export function Search({
  searchIcon = "MagnifyingGlass",
  label = false,
  variant,
  labelText,
  searchPlaceHolder,  
  showClearButton = true,
  clearButton = "XMark",
  ...rest
}: SearchProps) { return (
  <div>
    {label && <Label>{labelText}</Label>}
    <div className={cl(classes.wrapper, classes.border, classes[variant])}>
      <Icon iconName={searchIcon} className={classes.searchIcon} ></Icon>
      <input type='text'
        className={cl(classes.input, classes[variant])}
        placeholder={searchPlaceHolder}
        {...rest}
      ></input>
     {showClearButton && <Button 
        variant={"primary"} 
        icon={clearButton}  
        //onClick={test}
        size={'small'} 
        className={classes.clearButton}>
      </Button>}      
    </div>
  </div>
);
}

export default Search;


