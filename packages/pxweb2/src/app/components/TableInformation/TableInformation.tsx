import { useState, useEffect } from 'react';

import {
  SideSheet,
  TabsProvider,
  Tabs,
  Tab,
  TabPanel,
} from '@pxweb2/pxweb2-ui';

export interface TableInformationProps {
  readonly isOpen: boolean;
  readonly selectedTab?: string;
  readonly onClose: (isOpen: boolean) => void;
}

export function TableInformation({ isOpen, selectedTab, onClose }: TableInformationProps) {
  const [activeTab, setActiveTab] = useState('');


useEffect(() => {
    if (isOpen && selectedTab) {
        setActiveTab(selectedTab);
    }
}, [isOpen, selectedTab]);

  return (
    <SideSheet
      heading="Information"
      isOpen={isOpen}
      onClose={() => {
        onClose(false);
      }}
    >
      <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs variant="fixed">
          <Tab
            id="tab-footnotes"
            label="Footnotes"
            controls="pnl-footnotes"
          ></Tab>
          <Tab
            id="tab-definitions"
            label="Definitions"
            controls="pnl-definitions"
          ></Tab>
          <Tab id="tab-details" label="Details" controls="pnl-details"></Tab>
          <Tab id="tab-contact" label="Contact" controls="pnl-contact"></Tab>
        </Tabs>
        <TabPanel id="pnl-footnotes" controlledBy="tab-footnotes">
          Footnotes
        </TabPanel>
        <TabPanel id="pnl-definitions" controlledBy="tab-definitions">
          Definitions
        </TabPanel>
        <TabPanel id="pnl-details" controlledBy="tab-details">
          Details
        </TabPanel>
        <TabPanel id="pnl-contact" controlledBy="tab-contact">
          Contact
        </TabPanel>
      </TabsProvider>
    </SideSheet>
  );
}

export default TableInformation;
