import cl from 'clsx';
import classes from './Search.module.scss';
import {Icon} from '../Icon/Icon';
import {Label} from '../Typography/Label/Label';
import {Button} from '../Button/Button';
import React, { useState, useRef } from 'react';

export interface SearchProps 
extends React.InputHTMLAttributes <HTMLInputElement> {
  variant: 'default' | 'inVariableBox' ;
  labelText?: string;
  searchPlaceHolder?: string;  
}

export function Search({
  variant,
  labelText,
  searchPlaceHolder,  
  ...rest
}: SearchProps) { 
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null); 
  const handleClear = () => {
      setInputValue('');
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
  };
   const hasValue = inputValue.length > 0;
  return (
    <div className={classes.search}>
      {labelText && <Label size='medium'>{labelText}</Label>}
      <div className={cl(classes.wrapper, classes.border, classes[variant])}>
        <Icon 
          iconName="MagnifyingGlass" 
          className={classes.searchIcon} 
          aria-label={'Button with icon'}>
        </Icon>
        <input type='text'
          ref={inputRef}
          className={cl(classes.input, classes[variant])}
          placeholder={searchPlaceHolder}           
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          {...rest}
        ></input>
        {hasValue && (
          <Button 
            variant={"tertiary"} 
            icon="XMark"  
            size={'small'} 
            className={classes.clearButton}
            onClick={handleClear}
            aria-label={'Button with icon'}
          ></Button>
        )}      
      </div>
    </div>
  );
}

export default Search;