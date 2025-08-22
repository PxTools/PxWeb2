import { Meta, StoryObj } from '@storybook/react-vite';
import { BreadcrumbItem, Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
};

export default meta;

export const Default: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs
      variant="default"
      breadcrumbItems={[
        new BreadcrumbItem('Level 1', '/'),
        new BreadcrumbItem('Level 2', '/level2'),
        new BreadcrumbItem('Level 3', '/level2/level3'),
      ]}
    />
  ),
};

export const Compact: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs
      variant="compact"
      breadcrumbItems={[
        new BreadcrumbItem('Level 1', '/'),
        new BreadcrumbItem('Level 2', '/level2'),
        new BreadcrumbItem('Level 3', '/level2/level3'),
      ]}
    />
  ),
};

export const DeaultVersion: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs
      variant="default"
      breadcrumbItems={[
        new BreadcrumbItem('Statistical database', '/'),
        new BreadcrumbItem('Living conditions', '/level2'),
        new BreadcrumbItem('Children and their Families ', '/level2/level3'),
        new BreadcrumbItem('Families', '/level2/level3/level4'),
        new BreadcrumbItem(
          'Families with children and young persons aged 0-21 living at home by region, age of children, type of family and number of children. Year 2023 - 2024',
          '/level2/level3/level4/level5',
        ),
      ]}
    />
  ),
};

export const DeaultVersionLongTexts: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs
      variant="default"
      breadcrumbItems={[
        new BreadcrumbItem('Statistical database', '/'),
        new BreadcrumbItem('Housing, construction and building', '/level2'),
        new BreadcrumbItem(
          'Charges/rents for newly constructed dwellings',
          '/level2/level3',
        ),
        new BreadcrumbItem(
          'Rented dwellings and tenant-owned dwellings. Old tables – not updated. Year 2014-2022',
          '/level2/level3/level4',
        ),
        new BreadcrumbItem(
          'Rents in newly constructed buildings (rented dwellings) by region, investor and dwelling type. Year 2014 - 2022',
          '/level2/level3/level4/level5',
        ),
      ]}
    />
  ),
};

export const CompactVersion: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs
      variant="compact"
      breadcrumbItems={[
        new BreadcrumbItem('Statistical database', '/'),
        new BreadcrumbItem('Living conditions', '/level2'),
        new BreadcrumbItem('Children and their Families', '/level2/level3'),
        new BreadcrumbItem('Families', '/level2/level3/level4'),
        new BreadcrumbItem(
          'Families with children and young persons aged 0-21 living at home by region, age of children, type of family and number of children. Year 2023 - 2024',
          '/level2/level3/level4/level5',
        ),
      ]}
    />
  ),
};

export const CompactVersionLongTexts: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs
      variant="compact"
      breadcrumbItems={[
        new BreadcrumbItem('Statistical database', '/'),
        new BreadcrumbItem('Housing, construction and building', '/level2'),
        new BreadcrumbItem(
          'Charges/rents for newly constructed dwellings',
          '/level2/level3',
        ),
        new BreadcrumbItem(
          'Rented dwellings and tenant-owned dwellings. Old tables – not updated. Year 2014-2022',
          '/level2/level3/level4',
        ),
        new BreadcrumbItem(
          'Rents in newly constructed buildings (rented dwellings) by region, investor and dwelling type. Year 2014 - 2022',
          '/level2/level3/level4/level5',
        ),
      ]}
    />
  ),
};
