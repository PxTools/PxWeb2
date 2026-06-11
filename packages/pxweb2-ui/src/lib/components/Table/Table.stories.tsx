import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table } from './Table';
import { pxTable } from './Test/testData';

const mobileStoryTable = structuredClone(pxTable);
mobileStoryTable.heading = mobileStoryTable.heading.map((variable) => ({
  ...variable,
  values: variable.values.slice(0, 1),
}));

const meta: Meta<typeof Table> = {
  component: Table,
  title: 'Components/Table',
};
export default meta;
type Story = StoryObj<typeof Table>;

export const Default: Story = {
  args: {
    pxtable: pxTable,
    isMobile: false,
  },
};

export const Desktop: Story = {
  args: {
    pxtable: pxTable,
    isMobile: false,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export const Mobile: Story = {
  args: {
    pxtable: mobileStoryTable,
    isMobile: true,
    className: 'storybook-mobile-only',
  },
  render: (args) => (
    <>
      <style>{`.storybook-mobile-only thead { display: none; }`}</style>
      <Table {...args} />
    </>
  ),
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '375px', width: '100%', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};
