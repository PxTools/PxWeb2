import React, { useState, useRef } from 'react';
import cl from 'clsx';

import classes from './Search.module.scss';
import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';



export interface SearchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant: 'default' | 'inVariableBox';
  labelText?: string;
  searchPlaceHolder?: string;
  showLable?: boolean;
  ariaLabelIconText?: string;
  arilLabelButtonText?: string;
}

export function Search({
  variant,
  labelText,
  searchPlaceHolder,
  showLable = false,
  ariaLabelIconText = 'Search icon',
  arilLabelButtonText = 'Clear search button',
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

  const handleKeyDown = (e: { keyCode: number }) => {
    if (e.keyCode === 27) {
      handleClear();
    }
  };

  const hasValue = inputValue.length > 0;

  return (
    <div className={classes.search}>
      {showLable && <Label size='medium'>{labelText}</Label>}
      <div className={cl(classes.wrapper, classes.border, classes[variant])}>
        <Icon iconName='MagnifyingGlass' className={classes.searchIcon} aria-label={ariaLabelIconText}></Icon>
        <input
          type='text'
          ref={inputRef}
          className={cl(classes[`bodyshort-medium`], classes.input, classes[variant])}
          placeholder={searchPlaceHolder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          {...rest}
        ></input>
        {hasValue && (
          <Button
            variant='tertiary'
            icon='XMark'
            size='small'
            onClick={handleClear}
            aria-label={arilLabelButtonText}
          ></Button>
        )}
      </div>
    </div>
  );
}

export default Search;
