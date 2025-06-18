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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText(/region_1/i)).toBeTruthy();
    expect(canvas.getByText(/region_2/i)).toBeTruthy();
    expect(canvas.getByText(/region_3/i)).toBeTruthy();
    expect(canvas.getByText(/region_4/i)).toBeTruthy();
    expect(canvas.getByText(/CS_1/i)).toBeTruthy();
    expect(canvas.getByText(/CS_2/i)).toBeTruthy();
    expect(canvas.getByText(/CS_3/i)).toBeTruthy();
    expect(canvas.getByText(/CS_4/i)).toBeTruthy();
    expect(canvas.getByText(/CS_5/i)).toBeTruthy();
  },
};
