import type { Meta } from '@storybook/react';
import { Ingress } from './Ingress';

const meta: Meta<typeof Ingress> = {
  component: Ingress,
  title: 'Ingress',
};
export default meta;

export const Primary = {
  args: {
    children: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  },
};