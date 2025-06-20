import { useState, useRef, useEffect } from 'react';
import cl from 'clsx';

import { Icon } from '../Icon/Icon';
import { Label } from '../Typography/Label/Label';
import { Button } from '../Button/Button';
import styles from './SearchableSelect.module.scss';

export type SelectOption = {
  label: string;
  value: string;
};

type SearchableSelectProps = {
  id?: string;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  onSelect: (option: SelectOption | undefined) => void;
  selectedOption?: SelectOption;
  ariaLabel?: string;
};

export function SearchableSelect({
  id = 'searchable-select',
  options,
  placeholder,
  label,
  onSelect,
  selectedOption,
  ariaLabel,
}: Readonly<SearchableSelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen && selectedOption) {
      setInputValue(selectedOption.label);
    }
  }, [isOpen, selectedOption]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prev) =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
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
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const showClearButton = !!selectedOption || inputValue.length > 0;

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && (
        <Label htmlFor={id} size="medium">
          {label}
        </Label>
      )}
      <div className={styles.inputWrapper}>
        <input
          id={id}
          ref={inputRef}
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onFocus={() => setIsOpen(true)}
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
                )}
                role="option"
                tabIndex={-1}
                aria-selected={selectedOption?.value === option.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option)}
              >
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

export default SearchableSelect;
