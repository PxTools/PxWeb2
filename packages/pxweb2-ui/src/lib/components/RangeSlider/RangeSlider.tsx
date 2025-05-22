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
  onChange,
  minGap = 0,
}: RangeSliderProps) => {
  const [minVal, setMinVal] = useState<number>(min);
  const [maxVal, setMaxVal] = useState<number>(max);
  const [minInputValue, setMinInputValue] = useState<string>(String(min));
  const [maxInputValue, setMaxInputValue] = useState<string>(String(max));

  const sliderTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Resetting internal state to props:', { min, max });
    setMinVal(min);
    setMaxVal(max);
    setMinInputValue(String(min));
    setMaxInputValue(String(max));
  }, [min, max]);

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

  const applyMin = (value: number) => {
    if (value >= min && value <= maxVal - minGap) {
      setMinVal(value);
      onChange?.({ min: value, max: maxVal });
    }
  };

  const applyMax = (value: number) => {
    if (value <= max && value >= minVal + minGap) {
      setMaxVal(value);
      onChange?.({ min: minVal, max: value });
    }
  };

  const handleMinInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMinInputValue(value);
    const num = Number(value);
    if (Number.isFinite(num)) {
      applyMin(num);
    }
  };

  const handleMaxInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMaxInputValue(value);
    const num = Number(value);
    if (Number.isFinite(num)) {
      applyMax(num);
    }
  };

  const slideMin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMinVal(value);
    setMinInputValue(String(value));
  };

  const slideMax = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setMaxVal(value);
    setMaxInputValue(String(value));
  };

  const handleSliderRelease = () => {
    onChange?.({ min: minVal, max: maxVal });
  };

  return (
    <div className={cl(styles.rangeSliderWrapper)}>
      <div className={cl(styles.inputBox)}>
        <input
          type="number"
          value={minInputValue}
          onChange={handleMinInput}
          className={cl(styles.minInput)}
          min={min}
          max={maxVal - minGap}
        />
        <input
          type="number"
          value={maxInputValue}
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
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className={cl(styles.minVal)}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
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
