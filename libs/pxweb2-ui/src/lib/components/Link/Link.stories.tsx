import type { Meta, StoryObj } from '@storybook/react';
import { Link } from './Link';

/* import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest'; */

const meta: Meta<typeof Link> = {
  component: Link,
  title: 'Components/Link',
};
export default meta;

type Story = StoryObj<typeof Link>;

export const Primary: Story = {
  args: {
    href: '#',
    children: 'En godt skrevet lenketekst',
    icon: 'FileText',
  },
};
