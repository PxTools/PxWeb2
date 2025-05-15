import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RangeSlider.module.scss';
import cl from 'clsx';

export const RangeSlider: React.FC = () => {
  const initialMinYear = 1900;
  const initialMaxYear = 2025;

  const [sliderMinValue] = useState<number>(initialMinYear);
  const [sliderMaxValue] = useState<number>(initialMaxYear);

  const [minVal, setMinVal] = useState<number>(initialMinYear);
  const [maxVal, setMaxVal] = useState<number>(initialMaxYear);
  const [minInput, setMinInput] = useState<number>(initialMinYear);
  const [maxInput, setMaxInput] = useState<number>(initialMaxYear);

  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const minGap = 1;

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
      setMinInput(value);
    }
  };

  const slideMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value <= sliderMaxValue && value - minVal >= minGap) {
      setMaxVal(value);
      setMaxInput(value);
    }
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.value === '' ? sliderMinValue : parseInt(e.target.value, 10);
    if (value >= sliderMinValue && value < maxVal - minGap) {
      setMinInput(value);
      setMinVal(value);
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.value === '' ? sliderMaxValue : parseInt(e.target.value, 10);
    if (value <= sliderMaxValue && value > minVal + minGap) {
      setMaxInput(value);
      setMaxVal(value);
    }
  };

  const handleInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    type: 'min' | 'max',
  ) => {
    if (e.key === 'Enter') {
      const value = parseInt((e.target as HTMLInputElement).value, 10);
      if (
        type === 'min' &&
        value >= sliderMinValue &&
        value < maxVal - minGap
      ) {
        setMinVal(value);
      } else if (
        type === 'max' &&
        value <= sliderMaxValue &&
        value > minVal + minGap
      ) {
        setMaxVal(value);
      }
    }
  };

  return (
    <div className={cl(styles.rangeSliderWrapper)}>
      <div className={cl(styles.inputBox)}>
        <input
          type="number"
          value={minInput}
          onChange={handleMinInput}
          onKeyDown={(e) => handleInputKeyDown(e, 'min')}
          className={cl(styles.minInput)}
          min={sliderMinValue}
          max={maxVal - minGap}
        />
        <input
          type="number"
          value={maxInput}
          onChange={handleMaxInput}
          onKeyDown={(e) => handleInputKeyDown(e, 'max')}
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
