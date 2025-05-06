import type { Meta, StoryObj, StoryFn } from '@storybook/react';

import { FilterCategory } from './FilterCategory';
import Checkbox from '../Checkbox/Checkbox';

const meta: Meta<typeof FilterCategory> = {
  component: FilterCategory,
  title: 'Components/FilterCategory',
};
export default meta;

type Story = StoryObj<typeof FilterCategory>;

const filterItems = [
  {
    id: '1',
    text: 'Weekly',
    value: true,
  },
  {
    id: '2',
    text: 'Monthly',
    value: false,
  },
  {
    id: '3',
    text: 'Quarterly',
    value: false,
  },
];

const filterContent = (
  <div>
    {filterItems.map((it) => (
      <Checkbox
        key={it.id}
        id={it.id}
        text={it.text}
        onChange={() => {
          console.log('hei');
        }}
        value={it.value}
      />
    ))}
  </div>
);

export const Default: Story = {
  args: {
    header: 'Filter name',
    children: 'Filter content',
  },
};

export const WithFilterContent: StoryFn<typeof FilterCategory> = () => {
  return <FilterCategory header="Filter name">{filterContent}</FilterCategory>;
};

export const OpenByDefault: StoryFn<typeof FilterCategory> = () => {
  return (
    <FilterCategory header="Filter name" openByDefault>
      {filterContent}
    </FilterCategory>
  );
};
