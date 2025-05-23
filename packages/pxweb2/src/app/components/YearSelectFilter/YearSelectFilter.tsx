// YearSelectFilter.tsx – skiller ut input-komponent for korrekt hook-bruk

import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './YearSelectFilter.module.scss';

type YearSelectFilterProps = {
  availableYears: number[];
  onChange: (range: { min: number; max: number }) => void;
};

export const YearSelectFilter: React.FC<YearSelectFilterProps> = ({
  availableYears,
  onChange,
}) => {
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');

  const options = useMemo(
    () =>
      availableYears.map((year) => ({
        label: String(year),
        value: String(year),
      })),
    [availableYears],
  );
  const tryTriggerUpdate = (newFrom: string, newTo: string) => {
    const from = Number(newFrom);
    const to = Number(newTo);
    if (from > 0 && to > 0) {
      console.log('YearSelectFilter', { from, to });
      onChange({ min: from, max: to });
    }
  };

  return (
    <div className={styles.rangeFilter}>
      <YearInput
        label="Fra år"
        value={fromYear}
        setValue={setFromYear}
        otherValue={toYear}
        onComplete={tryTriggerUpdate}
        options={options}
        id="from"
      />
      <YearInput
        label="Til år"
        value={toYear}
        setValue={setToYear}
        otherValue={fromYear}
        onComplete={tryTriggerUpdate}
        options={options}
        id="to"
      />
    </div>
  );
};

const YearInput = ({
  label,
  value,
  setValue,
  otherValue,
  onComplete,
  options,
  id,
}: {
  label: string;
  value: string;
  setValue: (val: string) => void;
  otherValue: string;
  onComplete: (from: string, to: string) => void;
  options: { label: string; value: string }[];
  id: 'from' | 'to';
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      options.filter((opt) =>
        opt.label.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      ),
    [searchTerm, options],
  );

  const handleSelect = (selected: string) => {
    setValue(selected);
    setSearchTerm(selected);
    setIsOpen(false);
    setTimeout(() => {
      const newFrom = id === 'from' ? selected : otherValue;
      const newTo = id === 'to' ? selected : otherValue;
      onComplete(newFrom, newTo);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev === 0 ? filtered.length - 1 : prev - 1,
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filtered[highlightIndex];
      if (selected) {
        handleSelect(selected.value);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <label className={styles.label}>{label}</label>
      <input
        ref={inputRef}
        type="text"
        placeholder={`Søk ${label.toLowerCase()}...`}
        className={styles.searchInput}
        value={searchTerm}
        onFocus={() => setIsOpen(true)}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-activedescendant={filtered[highlightIndex]?.value}
        aria-controls={`${id}-option-list`}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        autoComplete="off"
      />

      {isOpen && filtered.length > 0 && (
        <ul
          className={styles.optionList}
          id={`${id}-option-list`}
          role="listbox"
        >
          {filtered.map((option, index) => (
            <li
              key={option.value}
              role="option"
              tabIndex={-1}
              aria-selected={value === option.value}
              onMouseDown={() => handleSelect(option.value)}
              className={`${styles.optionItem} ${
                value === option.value ? styles.selected : ''
              } ${highlightIndex === index ? styles.highlighted : ''}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default YearSelectFilter;
