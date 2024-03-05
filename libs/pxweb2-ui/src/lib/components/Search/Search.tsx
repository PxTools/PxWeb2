import cl from 'clsx';
import classes from './Search.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import{Label} from '../Typography/Label/Label';
import React from 'react';

export interface SearchProps 
extends React.InputHTMLAttributes <HTMLInputElement> {
  variant: 'default' | 'inVariableBox' ;
  label?: boolean; 
  labelText?: string;
  searchPlaceHolder?: string;
  icon?: IconProps['iconName'];  
}


export function Search({
  icon = "MagnifyingGlass",
  label = false,
  variant,
  labelText,
  searchPlaceHolder,
  ...rest
}: SearchProps) { return (
  <div>
    {label && <Label>{labelText}</Label>}
    <div className={cl(classes.wrapper, classes.border, classes[variant])}>
      <Icon iconName={icon}></Icon>
      <input type='text'
        className={cl(classes.input, classes[variant])}
        placeholder={searchPlaceHolder}
        {...rest}
      ></input>
    </div>
  </div>
);
}

export default Search;


