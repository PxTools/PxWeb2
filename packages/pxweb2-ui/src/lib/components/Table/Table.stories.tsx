import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Table } from './Table';
import { pxTable } from './testData';

const meta: Meta<typeof Table> = {
  component: Table,
  title: 'Components/Table',
};
export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    pxtable: pxTable,
  },
};
