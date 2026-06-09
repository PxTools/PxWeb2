import type { Meta, StoryObj, StoryFn } from '@storybook/react-vite';

import { FilterCategory } from './FilterCategory';
import Checkbox from '../Checkbox/Checkbox';

const meta: Meta<typeof FilterCategory> = {
  component: FilterCategory,
  title: 'Components/FilterCategory',
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
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
    screenReaderTxt: 'Filter screenreader content',
    children: 'Filter content',
  },
};

export const WithFilterContent: StoryFn<typeof FilterCategory> = () => {
  const activeFiltersCount = filterItems.filter((item) => item.value).length;

  return (
    <FilterCategory
      header="Filter name"
      screenReaderTxt="Filter screenreader content"
      activeFiltersCount={activeFiltersCount}
    >
      {filterContent}
    </FilterCategory>
  );
};

export const OpenByDefault: StoryFn<typeof FilterCategory> = () => {
  const activeFiltersCount = filterItems.filter((item) => item.value).length;

  return (
    <FilterCategory
      header="Filter name"
      screenReaderTxt="Filter screenreader content"
      activeFiltersCount={activeFiltersCount}
      openByDefault
    >
      {filterContent}
    </FilterCategory>
  );
};
