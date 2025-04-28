import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import { BottomSheet, BottomSheetProps } from './BottomSheet';
import Tabs from '../Tabs/Tabs';
import Tab from '../Tabs/Tab';
import { TabsProvider } from '../Tabs/TabsProvider';
import TabPanel from '../Tabs/TabPanel';

const meta: Meta<typeof BottomSheet> = {
  component: BottomSheet,
  title: 'Components/BottomSheet',
};
export default meta;

const content = 'Any content...';

export const Default = {
  args: {
    heading: 'Information',
    isOpen: true,
    onClose: () => {
      console.log('Modal closed');
    },
    children: <div>{content}</div>,
  },

  render: (args: BottomSheetProps) => (
    <BottomSheet {...args}>{content && <div>{content}</div>}</BottomSheet>
  ),

  return: BottomSheet,
};

export const MobileView: StoryFn<typeof BottomSheet> = () => {
  const [activeTab, setActiveTab] = useState('px-tab1');
  return (
    <BottomSheet
      heading="Information"
      isOpen={true} // Open by default
      onClose={() => {
        console.log('BottomSheet closed');
      }}
    >
      <div>
        <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
          <Tabs variant="scrollable">
            <Tab id="px-tab1" label="Tab1" controls="panel1"></Tab>
            <Tab id="px-tab2" label="Tab2" controls="panel2"></Tab>
            <Tab id="px-tab3" label="Tab3" controls="panel3"></Tab>
          </Tabs>
          <TabPanel id="panel1" controlledBy="px-tab1">
            Content for Tab 1 Content for Tab 1 Content for Tab 1 Content for
            Tab 1
          </TabPanel>
          <TabPanel id="panel2" controlledBy="px-tab2">
            Content for Tab 2 Content for Tab 2 Content for Tab 2 Content for
            Tab 2
          </TabPanel>
          <TabPanel id="panel3" controlledBy="px-tab3">
            Content for Tab 3 Content for Tab 3 Content for Tab 3
          </TabPanel>
        </TabsProvider>
      </div>
    </BottomSheet>
  );
};

MobileView.parameters = {
  viewport: {
    viewports: {
      mobile1: {
        name: 'Mobile 1',
        styles: {
          width: '375px',
          height: '667px',
        },
      },
      mobile2: {
        name: 'Mobile 2',
        styles: {
          width: '414px',
          height: '736px',
        },
      },
    },
    defaultViewport: 'mobile1',
  },
};
