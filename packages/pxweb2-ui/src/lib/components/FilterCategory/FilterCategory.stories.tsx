import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { FilterCategory } from './FilterCategory';
import Checkbox from '../Checkbox/Checkbox';
import { BodyLong } from '@pxweb2/pxweb2-ui';

const meta: Meta<typeof FilterCategory> = {
  component: FilterCategory,
  title: 'Components/FilterCategory',
};
export default meta;

type Story = StoryObj<typeof FilterCategory>;

const text =
  'This is a story about Little Red Ridinghood. One day she went into the wood to visit her grandmother. The day after too, She visited her every day, every week, every month, every year. She never saw a wolf, no even a little fox.';

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
    header: 'Heading',
    children: (
      <>
        <h3>Examle text</h3>
        <BodyLong size="medium">{text}</BodyLong>
      </>
    ),
  },
};

export const filterCategory: StoryFn<typeof FilterCategory> = () => {
  return <FilterCategory header="Filter name">{filterContent}</FilterCategory>;
};
