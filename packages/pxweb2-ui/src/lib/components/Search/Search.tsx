import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './Search.module.scss';
import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';

export interface SearchProps {
  value?: string;
  variant?: 'default' | 'inVariableBox';
  labelText?: string;
  searchPlaceHolder?: string;
  showLabel?: boolean;
  variableBoxTopBorderOverride?: boolean;
  arialLabelClearButtonText?: string;
  onChange?: (value: string) => void;
}

export interface SearchHandle extends HTMLInputElement {
  clearInputField: () => void;
}

export const Search = forwardRef<SearchHandle, SearchProps>(
  (
    {
      value = '',
      variant = 'default',
      labelText,
      searchPlaceHolder,
      showLabel = false,
      variableBoxTopBorderOverride = false,
      onChange,
      ...rest
    },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    const combinedRef = (ref || inputRef) as React.RefObject<SearchHandle>;
    const { t } = useTranslation();

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    const clearInputField = useCallback(() => {
      setInputValue('');
      onChange && onChange('');
    }, [onChange]);

    const handleClear = useCallback(() => {
      onChange && onChange('');
      setInputValue('');
      combinedRef.current?.focus();
    }, [onChange, combinedRef]);

    // Attach the clearInputField method to the ref
    useEffect(() => {
      if (combinedRef.current) {
        combinedRef.current.clearInputField = clearInputField;
      }
    }, [combinedRef, clearInputField]);

    const handleKeyDown = (
      e:
        | React.KeyboardEvent<HTMLDivElement>
        | React.KeyboardEvent<HTMLButtonElement>,
      isCancelButton?: boolean,
    ) => {
      const isEscape = e.key === 'Escape';
      const isEnterOrSpace = e.key === 'Enter' || e.key === ' ';
      const shouldClear = isEscape || (isCancelButton && isEnterOrSpace);

      if (shouldClear) {
        e.stopPropagation();
        e.preventDefault();
        handleClear();
      }
    };

    useImperativeHandle(ref, () => combinedRef.current, [combinedRef]);

    return (
      <div className={cl(classes.search, classes[variant])}>
        {showLabel && <Label size="medium">{labelText}</Label>}
        <div
          className={cl(classes.wrapper, classes.border, classes[variant], {
            [classes.variableboxSearchAndSelectBorderOverride]:
              variableBoxTopBorderOverride,
          })}
        >
          <Icon iconName="MagnifyingGlass"></Icon>
          <input
            type="text"
            {...(labelText ? { 'aria-label': labelText } : {})}
            ref={combinedRef}
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
              // Only handle keydown if there is a searchvalue
              if (inputValue !== '') {
                handleKeyDown(e, false);
              }
            }}
            {...rest}
          ></input>
          {inputValue.length > 0 && (
            <Button
              variant="tertiary"
              icon="XMark"
              size="small"
              onClick={() => {
                handleClear();
              }}
              onKeyDown={(e) => {
                handleKeyDown(e, true);
              }}
              aria-label={t(
                'presentation_page.side_menu.selection.variablebox.search.aria_label_clear_button_text',
              )}
            ></Button>
          )}
        </div>
      </div>
    );
  },
);

Search.displayName = 'Search';

export default Search;
