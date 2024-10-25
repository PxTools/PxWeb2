import type { Meta, StoryFn } from '@storybook/react';
import { useState } from 'react';

import Tabs from './Tabs';
import Tab from './Tab';
import { TabsProvider } from './TabsProvider';
import TabPanel from './TabPanel';

const meta: Meta<typeof Tabs> = {
  component: Tabs,
  title: 'Components/Tabs',
};
export default meta;

export const FixedTabs: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('px-tab1');

  return (
    <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
      <Tabs variant="fixed" ariaLabel="Fixed tabs">
        <Tab id="px-tab1" label="Tab1"></Tab>
        <Tab id="px-tab2" label="Tab2"></Tab>
        <Tab id="px-tab3" label="Tab3"></Tab>
        <Tab id="px-tab4" label="Tab4"></Tab>
      </Tabs>
    </TabsProvider>
  );
};

export const ScrollableTabs: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('px-tab1');

  return (
    <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
      <Tabs variant="scrollable" ariaLabel="Scrollable tabs">
        <Tab id="px-tab1" label="Tab1"></Tab>
        <Tab id="px-tab2" label="Tab2"></Tab>
        <Tab id="px-tab3" label="Tab3"></Tab>
        <Tab id="px-tab4" label="Tab4"></Tab>
      </Tabs>
    </TabsProvider>
  );
};

export const TwoTabLists: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('px-tab1');
  const [activeTab2, setActiveTab2] = useState('px-tab1');

  return (
    <>
      <h1 id="title1">My first tab</h1>
      <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs variant="fixed" layoutGroupId="first" ariaLabelledBy="title1">
          <Tab id="px-tab1" label="Tab1"></Tab>
          <Tab id="px-tab2" label="Tab2"></Tab>
          <Tab id="px-tab3" label="Tab3"></Tab>
        </Tabs>
      </TabsProvider>
      <h1 id="title2">My second tab</h1>
      <TabsProvider activeTab={activeTab2} setActiveTab={setActiveTab2}>
        <Tabs variant="fixed" layoutGroupId="second" ariaLabelledBy="title2">
          <Tab id="px-tab1" label="Tab1"></Tab>
          <Tab id="px-tab2" label="Tab2"></Tab>
          <Tab id="px-tab3" label="Tab3"></Tab>
        </Tabs>
      </TabsProvider>
    </>
  );
};

export const TabsFixedWithPanel: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('px-tab1');

  return (
    <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
      <Tabs variant="fixed">
        <Tab id="px-tab1" label="Tab1" controls="panel1"></Tab>
        <Tab id="px-tab2" label="Tab2" controls="panel2"></Tab>
        <Tab id="px-tab3" label="Tab3" controls="panel3"></Tab>
      </Tabs>
      <TabPanel id="panel1" controlledBy="px-tab1">
        Content for Tab 1 Content for Tab 1 Content for Tab 1 Content for Tab 1
      </TabPanel>
      <TabPanel id="panel2" controlledBy="px-tab2">
        Content for Tab 2 Content for Tab 2
      </TabPanel>
      <TabPanel id="panel3" controlledBy="px-tab3">
        Content for Tab 3 Content for Tab 3 Content for Tab 3
      </TabPanel>
    </TabsProvider>
  );
};

export const TabsScrollableWithPanel: StoryFn<typeof Tabs> = () => {
  const [activeTab, setActiveTab] = useState('px-tab1');

  return (
    <div>
      <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs variant="scrollable">
          <Tab id="px-tab1" label="Tab1" controls="panel1"></Tab>
          <Tab id="px-tab2" label="Tab2" controls="panel2"></Tab>
          <Tab id="px-tab3" label="Tab3" controls="panel3"></Tab>
        </Tabs>
        <TabPanel id="panel1" controlledBy="px-tab1">
          Content for Tab 1 Content for Tab 1 Content for Tab 1 Content for Tab
          1
        </TabPanel>
        <TabPanel id="panel2" controlledBy="px-tab2">
          Content for Tab 2 Content for Tab 2
        </TabPanel>
        <TabPanel id="panel3" controlledBy="px-tab3">
          Content for Tab 3 Content for Tab 3 Content for Tab 3
        </TabPanel>
      </TabsProvider>
    </div>
  );
};
