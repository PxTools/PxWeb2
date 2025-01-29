import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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

export function TableInformation({
  isOpen,
  selectedTab,
  onClose,
}: TableInformationProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (isOpen && selectedTab) {
      setActiveTab(selectedTab);
    }
  }, [isOpen, selectedTab]);

  return (
    <SideSheet
      heading={t('presentation_page.main_content.about_table.title')}
      isOpen={isOpen}
      onClose={() => {
        onClose(false);
      }}
    >
      <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
        <Tabs variant="fixed">
          <Tab
            id="tab-footnotes"
            label={t(
              'presentation_page.main_content.about_table.footnotes.title',
            )}
            controls="pnl-footnotes"
          ></Tab>
          <Tab
            id="tab-definitions"
            label={t(
              'presentation_page.main_content.about_table.definitions.title',
            )}
            controls="pnl-definitions"
          ></Tab>
          <Tab
            id="tab-details"
            label={t(
              'presentation_page.main_content.about_table.details.title',
            )}
            controls="pnl-details"
          ></Tab>
          <Tab
            id="tab-contact"
            label={t(
              'presentation_page.main_content.about_table.contact.title',
            )}
            controls="pnl-contact"
          ></Tab>
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
