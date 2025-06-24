import type { Meta, StoryObj } from '@storybook/react-vite';

import { ContentBox } from './ContentBox';

const meta: Meta<typeof ContentBox> = {
  component: ContentBox,
  title: 'Components/ContentBox',
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '3em',
          backgroundColor: 'var(--px-color-background-subtle)',
        }}
      >
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ContentBox>;

export const withTitle: Story = {
  name: 'With title',
  args: {
    title: 'Edit',
    children: <span>Children goes here</span>,
  },
};

export const withoutTitle: Story = {
  name: 'Without title',
  args: {
    children: <span>Children goes here</span>,
  },
};

export const withLongContent: Story = {
  name: 'With long content',
  args: {
    title: 'Long Content Example',
    children: (
      <>
        <span>Children goes here</span>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
          culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </>
    ),
  },
};
