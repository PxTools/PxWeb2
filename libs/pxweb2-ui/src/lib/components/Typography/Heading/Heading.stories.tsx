import type { Meta, StoryObj } from '@storybook/react';
import { Heading } from './Heading';

const meta: Meta<typeof Heading> = {
  component: Heading,
  title: 'Components/Typography/Heading',
  argTypes: {
    as: {
      table: {
        disable: true,
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Heading>;

const text = 'Heading is used for headlines to describe the content';

export const Default: Story = {
  args: {
    children: text,
  },
  argTypes: {
    size: {
      options: ['xlarge', 'large', 'medium', 'small', 'xsmall'],
      control: { type: 'radio' },
    },
    level: {
      control: { type: 'radio' },
    },
  },
};

export const HeadingXLarge: Story = {
  args: {
    size: 'xlarge',
    children: text,
  },
};

export const HeadingLarge: Story = {
  args: {
    size: 'large',
    children: text,
  },
};

export const HeadingMedium: Story = {
  args: {
    size: 'medium',
    children: text,
  },
};

export const HeadingSmall: Story = {
  args: {
    size: 'small',
    children: text,
  },
};
export const HeadingXSmall: Story = {
  args: {
    size: 'xsmall',
    children: text,
  },
};

export const HeadingAsLegend: Story = {
  args: {
    children: 'I am legend!',
    as: 'legend',
  },
};

export const HeadingNoSpacing: Story = {
  args: {
    children: text,
    spacing: false,
  },
};
