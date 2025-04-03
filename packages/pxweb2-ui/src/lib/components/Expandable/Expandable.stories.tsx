import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { Expandable } from './Expandable';
import Checkbox from '../Checkbox/Checkbox';

const meta: Meta<typeof Expandable> = {
  component: Expandable,
  title: 'Components/Expandable',
};
export default meta;

type Story = StoryObj<typeof Expandable>;

const filterItems = [
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
    content: (
      <div>
        <p>Content</p>
      </div>
    ),
  },
};

export const filterCategory: StoryFn<typeof Expandable> = () => {
  return <Expandable header="Filter name" content={filterContent} />;
};
