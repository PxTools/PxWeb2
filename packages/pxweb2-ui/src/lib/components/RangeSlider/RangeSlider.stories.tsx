import { useState } from 'react';
import type { Meta, StoryFn } from '@storybook/react';
import { RangeSlider } from './RangeSlider';

const meta: Meta<typeof RangeSlider> = {
  component: RangeSlider,
  title: 'Components/RangeSlider',
};
export default meta;

export const DefaultSlider: StoryFn<typeof RangeSlider> = () => {
  const [range, setRange] = useState({ min: 2000, max: 2020 });
  return (
    <div className="p-6">
      <h1>Velg år</h1>
      <RangeSlider
        rangeMin={1950}
        rangeMax={2025}
        initialMin={1950}
        initialMax={2025}
        minGap={0}
        onChange={(newRange) => setRange(newRange)}
      />
      <h2>
        Valgt intervall: {range.min} - {range.max}
      </h2>
    </div>
  );
};
