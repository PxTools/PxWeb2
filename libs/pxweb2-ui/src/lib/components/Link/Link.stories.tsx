import type { Meta } from '@storybook/react';
import { Link } from './Link';

/* import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest'; */

const meta: Meta<typeof Link> = {
  component: Link,
  title: 'Link',
};
export default meta;

export const Primary = {
  args: {
    href: '#',
    children: 'En godt skrevet lenketekst',
  },
};
