import { useState, useRef, useEffect, forwardRef } from 'react';
import cl from 'clsx';

import classes from './Search.module.scss';
import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';

export interface SearchProps {
  value?: string;
  variant: 'default' | 'inVariableBox';
  labelText?: string;
  searchPlaceHolder?: string;
  showLabel?: boolean;
  variableBoxTopBorderOverride?: boolean;
  ariaLabelIconText?: string;
  arialLabelClearButtonText?: string;
  onChange?: (value: string) => void;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      value = '',
      variant,
      labelText,
      searchPlaceHolder,
      showLabel = false,
      ariaLabelIconText = 'Search icon',
      arialLabelClearButtonText = 'Clear search button',
      variableBoxTopBorderOverride = false,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const handleClear = () => {
      onChange && onChange('');
      setInputValue('');
      if (inputRef.current !== null) {
        inputRef.current.focus();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (inputRef.current?.value.trim() === '') {
          inputRef.current?.blur();
        } else {
          handleClear();
        }
      }
    };

    return (
      <div className={cl(classes.search, classes[variant])}>
        {showLabel && <Label size="medium">{labelText}</Label>}
        <div
          className={cl(classes.wrapper, classes.border, classes[variant], {
            [classes.variableboxSearchAndSelectBorderOverride]:
              variableBoxTopBorderOverride,
          })}
        >
          <Icon
            iconName="MagnifyingGlass"
            className={classes.searchIcon}
            aria-label={ariaLabelIconText}
          ></Icon>
          <input
            type="text"
            ref={ref || inputRef}
            className={cl(
              classes[`bodyshort-medium`],
              classes.input,
              classes[variant],
            )}
            placeholder={searchPlaceHolder}
            value={inputValue}
            onChange={(e) => {
              onChange && onChange(e.target.value);
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => {
              handleKeyDown(e);
            }}
            {...rest}
          ></input>
          {inputValue.length > 0 && (
            <Button
              variant="tertiary"
              icon="XMark"
              size="small"
              onClick={() => {
                onChange && onChange('');
                handleClear();
              }}
              aria-label={arialLabelClearButtonText}
            ></Button>
          )}
        </div>
      </div>
    );
  },
);

Search.displayName = 'Search';

export default Search;
