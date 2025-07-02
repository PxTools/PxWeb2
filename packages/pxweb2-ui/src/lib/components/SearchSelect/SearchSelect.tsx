import { useState, useRef, useEffect } from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';
import styles from './SearchSelect.module.scss';

export type Option = {
  label: string;
  value: string;
};

type SearchSelectProps = {
  id?: string;
  options: Option[];
  placeholder?: string;
  label?: string;
  onSelect: (option: Option | undefined) => void;
  selectedOption?: Option;
  noOptionsText?: string;
  clearSelectionText?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
};

export function SearchSelect({
  id = 'searchable-select',
  options,
  placeholder,
  label,
  onSelect,
  selectedOption,
  noOptionsText = 'No results',
  clearSelectionText = 'Clear selection',
  inputMode,
}: Readonly<SearchSelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const searchSelectId = id ?? 'search-select';

  useEffect(() => {
    if (selectedOption) {
      setInputValue(selectedOption.label);
    }
  }, [selectedOption]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const filteredOptions = inputValue
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : options;

  const handleSelect = (option: Option) => {
    onSelect(option);
    setInputValue(option.label);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleClear = () => {
    setInputValue('');
    onSelect(undefined);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const lowerInput = inputValue.trim().toLowerCase();
    const exactMatch = options.find(
      (opt) => opt.label.toLowerCase() === lowerInput,
    );

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0,
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1,
        );
        break;
      case 'Enter':
        if (
          isOpen &&
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleSelect(filteredOptions[highlightedIndex]);
        } else if (exactMatch) {
          handleSelect(exactMatch);
        }
        break;
      case 'Tab':
        confirmSelection();
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
          setIsOpen(true);
        }
        break;
    }
  };

  const confirmSelection = () => {
    const trimmed = inputValue.trim().toLowerCase();
    const match = options.find((opt) => opt.label.toLowerCase() === trimmed);

    if (match) {
      handleSelect(match);
    } else {
      setInputValue('');
    }

    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const showClearButton = !!selectedOption || inputValue.length > 0;

  return (
    <div className={styles.searchableSelect}>
      {label && (
        <Label
          className={styles.label}
          id={`${searchSelectId}-label`}
          htmlFor={`${searchSelectId}-combobox`}
          size="medium"
        >
          {label}
        </Label>
      )}
      <div className={styles.contentWrapper} ref={contentRef}>
        <input
          id={`${searchSelectId}-combobox`}
          ref={inputRef}
          type="text"
          autoComplete="off"
          className={cl(styles.input, styles['bodyshort-medium'])}
          placeholder={placeholder}
          value={inputValue}
          onClick={() => setIsOpen(true)}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={() => setTimeout(confirmSelection, 100)}
          role="combobox"
          inputMode={inputMode}
          pattern={inputMode === 'numeric' ? '[0-9]*' : undefined}
          aria-autocomplete="list"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={`${searchSelectId}-listbox`}
          aria-activedescendant={
            highlightedIndex >= 0
              ? `${searchSelectId}-option-${highlightedIndex}`
              : undefined
          }
        />
        <div className={styles.iconWrapper}>
          {showClearButton ? (
            <Button
              variant="tertiary"
              icon="XMark"
              size="small"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleClear}
              aria-label={clearSelectionText}
              className={styles.clearSelection}
              type="button"
              tabIndex={0}
            />
          ) : (
            <Icon
              iconName="ChevronDown"
              className={cl(styles.chevron, { [styles.open]: isOpen })}
            />
          )}
        </div>
      </div>
      {isOpen && (
        <ul
          className={styles.optionList}
          role="listbox"
          id={`${searchSelectId}-listbox`}
          aria-labelledby={`${searchSelectId}-label`}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${searchSelectId}-option-${index}`}
                role="option"
                className={cl(
                  styles.option,
                  index === highlightedIndex && styles.highlighted,
                  styles['bodyshort-medium'],
                )}
                tabIndex={-1}
                aria-selected={inputValue === option.label}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(option);
                }}
              >
                {inputValue === option.value && (
                  <Icon iconName="Check" className={styles.checkIcon} />
                )}
                {option.label}
              </li>
            ))
          ) : (
            <li className={cl(styles.noMatch, styles['bodyshort-medium'])}>
              {noOptionsText}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchSelect;
