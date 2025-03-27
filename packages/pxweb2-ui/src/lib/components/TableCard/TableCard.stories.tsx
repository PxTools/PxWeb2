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
    size: 'medium',
    tableId: '00000',
    period: 'yyyy–yyyy',
    frequency: 'Time interval',
    updatedLabel: 'Oppdatert',
    lastUpdated: 'dd.mm.yyyy',
  },
};

export const Size: StoryFn<typeof TableCard> = () => {
  return (
    <>
      <h3>Medium:</h3>
      <TableCard
        href="/"
        icon={<AgricultureForestryHuntingAndFishing />}
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
      />
      <h3>Small:</h3>
      <TableCard
        href="/"
        icon={<AgricultureForestryHuntingAndFishing />}
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
        size="small"
      />
    </>
  );
};
export const WithoutIcon: StoryFn<typeof TableCard> = () => {
  return (
    <>
      <h3>Medium:</h3>
      <TableCard
        href="/"
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
      />

      <h3>Small:</h3>
      <TableCard
        href="/"
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
        size="small"
      />
    </>
  );
};

export const withoutTableId: StoryFn<typeof TableCard> = () => {
  return (
    <>
      <h3>Medium:</h3>
      <TableCard
        href="/"
        icon={<AgricultureForestryHuntingAndFishing />}
        title="Table title"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
      />
      <h3>Small:</h3>
      <TableCard
        href="/"
        icon={<AgricultureForestryHuntingAndFishing />}
        title="Table title"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
        size="small"
      />
    </>
  );
};

export const StatusClosed: StoryFn<typeof TableCard> = () => {
  return (
    <>
      <h3>Medium:</h3>
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
      <h3>Small:</h3>
      <TableCard
        href="/"
        icon={<AgricultureForestryHuntingAndFishing />}
        title="Table title"
        tableId="00000"
        period="yyyy–yyyy"
        frequency="Time interval"
        updatedLabel="Oppdatert"
        lastUpdated="dd.mm.yyyy"
        size="small"
        status="closed"
      />
    </>
  );
};
