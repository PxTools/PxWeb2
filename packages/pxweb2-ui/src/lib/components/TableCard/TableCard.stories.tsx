import type { Meta, StoryObj, StoryFn } from '@storybook/react';

import { TableCard } from './TableCard';
import { Icon } from '../Icon/Icon';

const meta: Meta<typeof TableCard> = {
  component: TableCard,
  title: 'Components/TableCard',
};
export default meta;

type Story = StoryObj<typeof TableCard>;

const exampleIcon = <Icon iconName="Table" />;

export const Default: Story = {
  args: {
    icon: exampleIcon,
    href: '#',
    title: 'Table title',
    tableId: '00000',
    period: 'yyyy–yyyy',
    frequency: 'Time interval',
    updatedLabel: 'Updated',
    lastUpdated: 'mm/dd/yyyy',
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
      updatedLabel="Updated"
      lastUpdated="mm/dd/yyyy"
    />
  );
};

export const withoutTableNumber: StoryFn<typeof TableCard> = () => {
  return (
    <TableCard
      href="/"
      icon={exampleIcon}
      title="Table title"
      period="yyyy–yyyy"
      frequency="Time interval"
      updatedLabel="Updated"
      lastUpdated="mm/dd/yyyy"
    />
  );
};

export const StatusClosed: StoryFn<typeof TableCard> = () => {
  return (
    <TableCard
      href="/"
      icon={exampleIcon}
      title="Table title"
      tableId="00000"
      period="yyyy–yyyy"
      frequency="Time interval"
      updatedLabel="Updated"
      lastUpdated="mm/dd/yyyy"
      status="closed"
    />
  );
};
