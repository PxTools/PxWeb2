import cl from 'clsx';
import classes from './Search.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import{Label} from '../Typography/Label/Label';
import React from 'react';

export interface SearchProps 
extends React.InputHTMLAttributes <HTMLInputElement> {
  variant: 'default' | 'inVariableBox' ;
  lable?: boolean; 
  lableText?: string;
  icon?: IconProps['iconName'];  
}


export function Search({
  icon = "MagnifyingGlass",
  lable = false,
  variant,
  lableText,
  ...rest
}: SearchProps) { return (
  <div>
    {lable && <Label>{lableText}</Label>}
    <div className={cl(classes.wrapper, classes.border, classes[variant])}>
      <Icon iconName={icon}></Icon>
      <input
        className={cl(classes.input, classes[variant])}
        {...rest}
      ></input>
    </div>
  </div>
);
}

export default Search;


