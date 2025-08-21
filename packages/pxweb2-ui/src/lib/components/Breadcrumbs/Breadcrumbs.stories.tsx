import { Meta, StoryObj } from '@storybook/react-vite';
import { BreadcrumbItem, Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs';

const meta: Meta<BreadcrumbsProps> = {
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
        new BreadcrumbItem('Children and their Families bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla bla', '/level2/level3'),
        new BreadcrumbItem('Families', '/level2/level3/level4'),
        new BreadcrumbItem(
          'Families with children and young persons aged 0-21 living at home by region, age of children, type of family and number of children. Year 2023 - 2024',
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
