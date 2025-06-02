import React, { useState, useEffect, useRef, useCallback } from 'react';
import cl from 'clsx';

import styles from './RangeSlider.module.scss';

export interface RangeSliderProps {
  rangeMin: number;
  rangeMax: number;
  initialMin?: number;
  initialMax?: number;
  onChange?: (range: { min: number; max: number }) => void;
  minGap?: number;
}

export const RangeSlider = ({
  rangeMin,
  rangeMax,
  initialMin,
  initialMax,
  onChange,
  minGap = 0,
}: RangeSliderProps) => {
  const [sliderMin, setSliderMin] = useState<number>(initialMin ?? rangeMin);
  const [sliderMax, setSliderMax] = useState<number>(initialMax ?? rangeMax);
  const [minInputValue, setMinInputValue] = useState<string>(
    String(initialMin ?? rangeMin),
  );
  const [maxInputValue, setMaxInputValue] = useState<string>(
    String(initialMax ?? rangeMax),
  );

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const startMin = initialMin ?? rangeMin;
    const startMax = initialMax ?? rangeMax;
    setSliderMin(startMin);
    setSliderMax(startMax);
    setMinInputValue(String(startMin));
    setMaxInputValue(String(startMax));
  }, [rangeMin, rangeMax, initialMin, initialMax]);

  const setSliderTrack = useCallback(() => {
    const range = sliderTrackRef.current;
    if (range) {
      const minPercent = ((sliderMin - rangeMin) / (rangeMax - rangeMin)) * 100;
      const maxPercent = ((sliderMax - rangeMin) / (rangeMax - rangeMin)) * 100;
      range.style.left = `${minPercent}%`;
      range.style.right = `${100 - maxPercent}%`;
    }
  }, [sliderMin, sliderMax, rangeMin, rangeMax]);

  useEffect(() => {
    setSliderTrack();
  }, [setSliderTrack]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const debouncedOnChange = useCallback(
    (min: number, max: number) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        onChange?.({ min, max });
      }, 500);
    },
    [onChange],
  );

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinInputValue(value);
    const num = Number(value);
    if (Number.isFinite(num) && num >= rangeMin && num <= sliderMax - minGap) {
      setSliderMin(num);
      debouncedOnChange(num, sliderMax);
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxInputValue(value);
    const num = Number(value);
    if (Number.isFinite(num) && num <= rangeMax && num >= sliderMin + minGap) {
      setSliderMax(num);
      debouncedOnChange(sliderMin, num);
    }
  };

  const slideMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), sliderMax - minGap);
    setSliderMin(value);
    setMinInputValue(String(value));
  };

  const slideMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), sliderMin + minGap);
    setSliderMax(value);
    setMaxInputValue(String(value));
  };

  const handleSliderRelease = () => {
    onChange?.({ min: sliderMin, max: sliderMax });
  };

  return (
    <div className={cl(styles.rangeSliderWrapper)}>
      <div className={cl(styles.inputBox)}>
        <input
          type="number"
          value={minInputValue}
          onChange={handleMinInput}
          className={cl(styles.minInput)}
          min={rangeMin}
          max={sliderMax - minGap}
        />
        <input
          type="number"
          value={maxInputValue}
          onChange={handleMaxInput}
          className={cl(styles.maxInput)}
          min={sliderMin + minGap}
          max={rangeMax}
        />
      </div>
      <div className={cl(styles.rangeSlider)}>
        <div ref={sliderTrackRef} className={cl(styles.sliderTrack)} />
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          value={sliderMin}
          onChange={slideMin}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className={cl(styles.minVal)}
        />
        <input
          type="range"
          min={rangeMin}
          max={rangeMax}
          value={sliderMax}
          onChange={slideMax}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className={cl(styles.maxVal)}
        />
      </div>
    </div>
  );
};

export default RangeSlider;
