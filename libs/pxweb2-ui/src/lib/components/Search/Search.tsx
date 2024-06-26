import React, { useState, useRef } from 'react';
import cl from 'clsx';

import classes from './Search.module.scss';
import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';

export interface SearchProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant: 'default' | 'inVariableBox';
  labelText?: string;
  searchPlaceHolder?: string;
  showLabel?: boolean;
  variableBoxTopBorderOverride?: boolean;
  ariaLabelIconText?: string;
  arialLabelClearButtonText?: string;
}

export function Search({
  variant,
  labelText,
  searchPlaceHolder,
  showLabel = false,
  ariaLabelIconText = 'Search icon',
  arialLabelClearButtonText = 'Clear search button',
  variableBoxTopBorderOverride = false,
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
      {showLabel && <Label size="medium">{labelText}</Label>}
      <div className={cl(classes.wrapper, classes.border, classes[variant], {
              [classes.variableboxSearchAndSelectBorderOverride]: variableBoxTopBorderOverride,
            })}>
        <Icon
          iconName="MagnifyingGlass"
          className={classes.searchIcon}
          aria-label={ariaLabelIconText}
        ></Icon>
        <input
          type="text"
          ref={inputRef}
          className={cl(
            classes[`bodyshort-medium`],
            classes.input,
            classes[variant]
          )}
          placeholder={searchPlaceHolder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          {...rest}
        ></input>
        {hasValue && (
          <Button
            variant="tertiary"
            icon="XMark"
            size="small"
            onClick={handleClear}
            aria-label={arialLabelClearButtonText}
          ></Button>
        )}
      </div>
    </div>
  );
}

export default Search;
