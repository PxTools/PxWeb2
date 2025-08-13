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
        new BreadcrumbItem(
          'Level 1 Level 1 Level 1 Level 1 Level 1 Level 1',
          '/',
        ),
        new BreadcrumbItem('Level 2', '/level2'),
        new BreadcrumbItem('Level 3', '/level2/level3'),
      ]}
    />
  ),
};

export const CompactWithLessText: StoryObj<typeof Breadcrumbs> = {
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
