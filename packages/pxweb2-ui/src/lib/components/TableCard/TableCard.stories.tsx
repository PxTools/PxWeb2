import type { Meta, StoryFn } from '@storybook/react';
import { TableCard } from './TableCard';
import { AgricultureForestryHuntingAndFishing } from './IconsTopic';

const meta: Meta<typeof TableCard> = {
  component: TableCard,
  title: 'Components/TableCard',
};
export default meta;

export const FixedTabs: StoryFn<typeof TableCard> = () => {
  return (
    <TableCard
      icon={<AgricultureForestryHuntingAndFishing  />}
      title="Utenrikshandel med varer, etter varenummer (HS) og land"
      tableId="08799"
      period="1988–2024"
      frequency="Månedlig"
      lastUpdated="15.10.2024"
    />
  );
};
