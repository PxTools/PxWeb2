import cl from 'clsx';
import classes from './Search.module.scss';
import { Icon, IconProps } from '../Icon/Icon';
import React from 'react';

export interface SearchProps {
  variant: 'default' | 'inVariableBox' ;
  lable?: boolean; 
  lableText?: string;
  icon?: IconProps['iconName'];
//   text?: string;  
}


export function Search({
  icon,
  lable = false,
  variant,
  lableText,
  ...rest
}: SearchProps) { return (
  <form>
  <input 
    className={cl(classes[variant],classes.label, classes.lableText
    )}
    {...rest}
  >  
  {icon && <Icon iconName={icon}></Icon>}
  </input>
  </form>
);
}

export default Search;


