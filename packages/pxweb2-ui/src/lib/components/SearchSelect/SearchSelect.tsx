import { useState, useRef, useEffect } from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';
import styles from './SearchSelect.module.scss';

export type SelectOption = {
  label: string;
  value: string;
};

type SearchSelectProps = {
  id?: string;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  onSelect: (option: SelectOption | undefined) => void;
  selectedOption?: SelectOption;
  ariaLabel?: string;
};

export function SearchSelect({
  id = 'searchable-select',
  options,
  placeholder,
  label,
  onSelect,
  selectedOption,
  ariaLabel,
}: Readonly<SearchSelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen && selectedOption) {
      setInputValue(selectedOption.label);
    }
  }, [isOpen, selectedOption]);

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

  const handleSelect = (option: SelectOption) => {
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

  const handleClickInput = () => {
    console.log('klikk');
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1,
      );
    } else if (e.key === 'Enter') {
      if (
        isOpen &&
        highlightedIndex >= 0 &&
        highlightedIndex < filteredOptions.length
      ) {
        handleSelect(filteredOptions[highlightedIndex]);
      } else {
        const exactMatch = options.find(
          (opt) => opt.label.toLowerCase() === inputValue.trim().toLowerCase(),
        );
        if (exactMatch) {
          handleSelect(exactMatch);
        }
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const showClearButton = !!selectedOption || inputValue.length > 0;

  return (
    <div className={styles.searchableSelect}>
      {label && (
        <Label className={styles.label} htmlFor={id} size="medium">
          {label}
        </Label>
      )}
      <div className={styles.contentWrapper} ref={contentRef}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          className={cl(styles.input, styles['bodyshort-medium'])}
          placeholder={placeholder}
          value={inputValue}
          onClick={handleClickInput}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            setTimeout(() => setIsOpen(false), 100);
          }}
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="searchable-select-listbox"
        />
        <div className={styles.iconWrapper}>
          {showClearButton ? (
            <Button
              variant="tertiary"
              icon="XMark"
              size="small"
              onClick={handleClear}
              aria-label="Fjern valg"
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
          id="searchable-select-listbox"
          role="listbox"
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <li
                key={option.value}
                className={cl(
                  styles.option,
                  index === highlightedIndex && styles.highlighted,
                  styles['bodyshort-medium'],
                )}
                role="option"
                tabIndex={index === highlightedIndex ? 0 : -1}
                aria-selected={inputValue === option.label}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
              >
                {inputValue === option.value && (
                  <Icon iconName="Check" className={styles.checkIcon} />
                )}
                {option.label}
              </li>
            ))
          ) : (
            <li className={styles.noMatch}>Ingen treff</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchSelect;
