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
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  onSelect: (option: SelectOption | undefined) => void;
  selectedOption?: SelectOption;
  ariaLabel?: string;
};

export function SearchableSelect({
  options,
  placeholder,
  label,
  onSelect,
  selectedOption,
  ariaLabel,
}: Readonly<SearchableSelectProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue === '') {
      setFilteredOptions(options);
    } else {
      const lower = inputValue.toLowerCase();
      setFilteredOptions(
        options.filter((opt) => opt.label.toLowerCase().includes(lower)),
      );
    }
  }, [inputValue, options]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {label && <Label size="medium">{label}</Label>}
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={isOpen ? inputValue : (selectedOption?.label ?? '')}
          onFocus={() => {
            setIsOpen(true);
            setInputValue('');
          }}
          onChange={(e) => setInputValue(e.target.value)}
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="searchable-select-listbox"
          aria-activedescendant={selectedOption?.value ?? ''}
        />
        {selectedOption && !isOpen && (
          <Button
            variant="tertiary"
            icon="XMark"
            size="small"
            onClick={() => onSelect(undefined)}
            aria-label="Fjern valg"
          />
        )}
        <Icon
          iconName="ChevronDown"
          className={cl(styles.chevron, { [styles.open]: isOpen })}
        />
      </div>
      {isOpen && (
        <ul className={styles.optionList}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <li
                key={option.value}
                className={styles.option}
                role="option"
                aria-selected={selectedOption?.value === option.value}
                tabIndex={0}
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(option);
                    setIsOpen(false);
                  }
                }}
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
