import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RangeSlider.module.scss';
import cl from 'clsx';

type RangeSliderProps = {
  min: number;
  max: number;
  minGap?: number;
  onChange?: (range: { min: number; max: number }) => void;
};

export const RangeSlider = ({ min, max, minGap = 1 ,onChange }: RangeSliderProps) => {
  const [sliderMinValue] = useState<number>(min);
  const [sliderMaxValue] = useState<number>(max);
  const [minVal, setMinVal] = useState<number>(min);
  const [maxVal, setMaxVal] = useState<number>(max);

  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const setSliderTrack = useCallback(() => {
    const range = sliderTrackRef.current;
    if (range) {
      const minPercent =
        ((minVal - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
      const maxPercent =
        ((maxVal - sliderMinValue) / (sliderMaxValue - sliderMinValue)) * 100;
      range.style.left = `${minPercent}%`;
      range.style.right = `${100 - maxPercent}%`;
    }
  }, [minVal, maxVal, sliderMinValue, sliderMaxValue]);

  useEffect(() => {
    setSliderTrack();
  }, [setSliderTrack]);

  const slideMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= sliderMinValue && maxVal - value >= minGap) {
      setMinVal(value);
      onChange?.({ min: value, max: maxVal });
    }
  };

  const slideMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value <= sliderMaxValue && value - minVal >= minGap) {
      setMaxVal(value);
      onChange?.({ min: minVal, max: value });
    }
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.value === '' ? sliderMinValue : parseInt(e.target.value, 10);
    if (value >= sliderMinValue && value < maxVal - minGap) {
      setMinVal(value);
      onChange?.({ min: value, max: maxVal });
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.value === '' ? sliderMaxValue : parseInt(e.target.value, 10);
    if (value <= sliderMaxValue && value > minVal + minGap) {
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
          min={sliderMinValue}
          max={maxVal - minGap}
        />
        <input
          type="number"
          value={maxVal}
          onChange={handleMaxInput}
          className={cl(styles.maxInput)}
          min={minVal + minGap}
          max={sliderMaxValue}
        />
      </div>
      <div className={cl(styles.rangeSlider)}>
        <div ref={sliderTrackRef} className={cl(styles.sliderTrack)} />
        <input
          type="range"
          min={sliderMinValue}
          max={sliderMaxValue}
          value={minVal}
          onChange={slideMin}
          className={cl(styles.minVal)}
        />
        <input
          type="range"
          min={sliderMinValue}
          max={sliderMaxValue}
          value={maxVal}
          onChange={slideMax}
          className={cl(styles.maxVal)}
        />
      </div>
    </div>
  );
};
export default RangeSlider;
