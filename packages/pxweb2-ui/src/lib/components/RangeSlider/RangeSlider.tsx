import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RangeSlider.module.scss';
import cl from 'clsx';

type RangeSliderProps = {
  min: number;
  max: number;
  onChange?: (range: { min: number; max: number }) => void;
  minGap?: number;
};

export const RangeSlider = ({
  min,
  max,
  minGap = 0,
  onChange
}: RangeSliderProps) => {
  const [minVal, setMinVal] = useState<number>(min);
  const [maxVal, setMaxVal] = useState<number>(max);

  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const setSliderTrack = useCallback(() => {
    const range = sliderTrackRef.current;
    if (range) {
      const minPercent = ((minVal - min) / (max - min)) * 100;
      const maxPercent = ((maxVal - min) / (max - min)) * 100;
      range.style.left = `${minPercent}%`;
      range.style.right = `${100 - maxPercent}%`;
    }
  }, [minVal, maxVal, min, max]);

  useEffect(() => {
    setSliderTrack();
  }, [setSliderTrack]);

  

  const slideMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value >= min && value <= maxVal - minGap) {
      setMinVal(value);
      onChange?.({ min: value, max: maxVal });
    }
  };
  
  const slideMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (value <= max && value >= minVal + minGap) {
      setMaxVal(value);
      onChange?.({ min: minVal, max: value });
    }
  };
  
  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isFinite(value) && value >= min && value <= maxVal - minGap) {
      setMinVal(value);
      onChange?.({ min: value, max: maxVal });
    }
  };
  
  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (Number.isFinite(value) && value <= max && value >= minVal + minGap) {
      setMaxVal(value);
      onChange?.({ min: minVal, max: value });
    }
  };

  return (
    <div className={cl(styles.rangeSliderWrapper)}>
      <div className={cl(styles.inputBox)}>
        <input
          type="number"
          value={minVal}
          onChange={handleMinInput}
          className={cl(styles.minInput)}
          min={min}
          max={maxVal - minGap}
        />
        <input
          type="number"
          value={maxVal}
          onChange={handleMaxInput}
          className={cl(styles.maxInput)}
          min={minVal + minGap}
          max={max}
        />
      </div>
      <div className={cl(styles.rangeSlider)}>
        <div ref={sliderTrackRef} className={cl(styles.sliderTrack)} />
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={slideMin}
          className={cl(styles.minVal)}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={slideMax}
          className={cl(styles.maxVal)}
        />
      </div>
    </div>
  );
};

export default RangeSlider;
