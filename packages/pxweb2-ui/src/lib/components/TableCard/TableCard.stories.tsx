import type { Meta, StoryObj, StoryFn } from '@storybook/react';
import { TableCard } from './TableCard';
import { AgricultureForestryHuntingAndFishing } from './IconsTopic';

const meta: Meta<typeof TableCard> = {
  component: TableCard,
  title: 'Components/TableCard',
};
export default meta;

type Story = StoryObj<typeof TableCard>;

export const Default: Story = {
  args: {
    icon: <AgricultureForestryHuntingAndFishing />,
    href: '#',
    title: 'Table title',
    tableId: '00000',
    period: 'yyyy–yyyy',
    frequency: 'Time interval',
    updatedLabel: 'Oppdatert',
    lastUpdated: 'dd.mm.yyyy',
  },
};

export const withoutIcon: StoryFn<typeof TableCard> = () => {
  return (
    <TableCard
      href="/"
      title="Table title"
      tableId="00000"
      period="yyyy–yyyy"
      frequency="Time interval"
      updatedLabel="Oppdatert"
      lastUpdated="dd.mm.yyyy"
    />
  );
};

export const withoutTableNumber: StoryFn<typeof TableCard> = () => {
  return (
    <TableCard
      href="/"
      icon={<AgricultureForestryHuntingAndFishing />}
      title="Table title"
      period="yyyy–yyyy"
      frequency="Time interval"
      updatedLabel="Oppdatert"
      lastUpdated="dd.mm.yyyy"
    />
  );
};

export const StatusClosed: StoryFn<typeof TableCard> = () => {
  return (
    <TableCard
      href="/"
      icon={<AgricultureForestryHuntingAndFishing />}
      title="Table title"
      tableId="00000"
      period="yyyy–yyyy"
      frequency="Time interval"
      updatedLabel="Oppdatert"
      lastUpdated="dd.mm.yyyy"
      status="closed"
    />
  );
};
