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

// export const Options = {
//   args: {
//     size: 'medium',
//   },

//   argTypes: {
//     size: {
//       options: ['xsmall', 'small', 'medium', 'large', 'xlarge'],
//       control: { type: 'radio' },
//     },
//   },
// };

// export const FixedTabs: StoryFn<typeof Tabs> = () => {
//   const [activeTab, setActiveTab] = useState('px-tab1');

//   return (
//     <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
//       <Tabs variant="fixed" ariaLabel="Fixed tabs">
//         <Tab id="px-tab1" label="Tab1"></Tab>
//         <Tab id="px-tab2" label="Tab2"></Tab>
//         <Tab id="px-tab3" label="Tab3"></Tab>
//         <Tab id="px-tab4" label="Tab4"></Tab>
//       </Tabs>
//     </TabsProvider>
//   );
// };

export const Default: StoryObj<typeof Breadcrumbs> = () => {
  return (
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
  );
};

export const Compact: StoryObj<typeof Breadcrumbs> = () => {
  return (
    <Breadcrumbs variant="compact">
      <Link inline={true} href="/">
        Home_Home_Home_Home_Home_Home_Home_Home Home Home
      </Link>
      <Link inline={true} href="/library">
        Library Library Library Library Library Library Library Library Library Library
      </Link>
      <Link inline={true} href="/library/data" aria-current="page">
        Data Data Data Data Data Data Data Data Data Data
      </Link>
    </Breadcrumbs>
  );
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
