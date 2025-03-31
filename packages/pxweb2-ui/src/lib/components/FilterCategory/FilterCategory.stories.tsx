import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { FilterCategory } from './FilterCategory';

const meta: Meta<typeof FilterCategory> = {
  component: FilterCategory,
  title: 'Components/FilterCategory',
};
export default meta;

type Story = StoryObj<typeof FilterCategory>;

const checkboxItems = [
  {
    id: '1',
    text: 'Kvartal',
    value: false,
  },
  {
    id: '2',
    text: 'Måned',
    value: false,
  },
  {
    id: '3',
    text: 'År',
    value: false,
  },
];

export const Default: Story = {
  args: {
    heading: 'Frekvens',
    items: checkboxItems,
  },
};

export const withoutIcon: StoryFn<typeof FilterCategory> = () => {
  return <FilterCategory heading="Frekvens" items={checkboxItems} />;
};
