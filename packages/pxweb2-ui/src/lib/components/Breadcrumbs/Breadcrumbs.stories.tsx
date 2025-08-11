import React from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, BreadcrumbsProps } from './Breadcrumbs';
import Link from '../Link/Link';

const meta: Meta<BreadcrumbsProps> = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  tags: ['autodocs'],
};


export default meta;


export const Default: StoryObj<typeof Breadcrumbs> =  {
  render: () => (
    <Breadcrumbs variant="default">
      <Link inline={true} href="/">
        Home
      </Link>
      <Link inline={true} href="/library">
        Library
      </Link>
      <Link inline={true} href="/library/data" aria-current="page">
        Data
      </Link>
    </Breadcrumbs>
  ),
};

export const Compact: StoryObj<typeof Breadcrumbs> = {
  render: () => (
    <Breadcrumbs variant="compact">
      <Link inline={true} href="/">
        Home
      </Link>
      <Link inline={true} href="/library">
        Library Library
      </Link>
      <Link inline={true} href="/library/data" aria-current="page">
        Data Data Data Data Data Data Data Data Data Data
      </Link>
    </Breadcrumbs>
  ),
};


export const CompactLess: StoryObj<typeof Breadcrumbs> =  {
  render: () => (
    <Breadcrumbs variant="compact">
      <Link inline={true} href="/">
        Home
      </Link>
      <Link inline={true} href="/library">
        Library
      </Link>
      <Link inline={true} href="/library/data" aria-current="page">
        Data
      </Link>
    </Breadcrumbs>
  ),
};



// export const SingleItem: StoryObj<BreadcrumbsProps> = {
//   args: {
//     links: [{ label: 'Home', href: '/' }],
//   },
// };

// export const CustomSeparator: StoryObj<BreadcrumbsProps> = {
//   args: {
//     links,
//     separator: '>',
//   },
// };
