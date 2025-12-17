import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import cl from 'clsx';

import classes from './TableInformation.module.scss';
import useTableData from '../../context/useTableData';
import { ContactTab } from './Contact/ContactTab';
import { DetailsTab } from './Details/DetailsTab';
import useApp from '../../context/useApp';

import {
  SideSheet,
  BottomSheet,
  TabsProvider,
  Tabs,
  Tab,
  TabPanel,
  LocalAlert,
} from '@pxweb2/pxweb2-ui';
import { NotesTab } from './Notes/NotesTab';

export interface TableInformationProps {
  readonly isOpen: boolean;
  readonly selectedTab?: string;
  readonly onClose: () => void;
}

export function TableInformation({
  isOpen,
  selectedTab,
  onClose,
}: TableInformationProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('');
  const tableData = useTableData();
  const { isMobile } = useApp();
  const tabsContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && selectedTab) {
      setActiveTab(selectedTab);
    }
  }, [isOpen, selectedTab]);

  useEffect(() => {
    if (tabsContentRef.current) {
      tabsContentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // TableInformation tabs should be type in some way. Maybe like this:
  // export type TabType = 'tab-footnotes' | 'tab-definitions' | 'tab-details' | 'tab-contact';

  const SheetComponent = isMobile ? BottomSheet : SideSheet;
  const tabsVariant = isMobile ? 'scrollable' : 'fixed';

  return (
    <SheetComponent
      heading={t('presentation_page.main_content.about_table.title')}
      closeLabel={t('common.generic_buttons.close')}
      isOpen={isOpen}
      onClose={() => {
        onClose();
      }}
    >
      <TabsProvider activeTab={activeTab} setActiveTab={setActiveTab}>
        <div className={cl(classes.tabs)}>
          <Tabs variant={tabsVariant}>
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
        </div>
        <div
          ref={tabsContentRef}
          className={cl(
            classes.tabsContent,
            classes['bodyshort-medium'],
            isMobile && classes.mobileView,
          )}
        >
          <TabPanel id="pnl-footnotes" controlledBy="tab-footnotes">
            <NotesTab pxTableMetadata={tableData.data?.metadata} />
          </TabPanel>
          <TabPanel id="pnl-definitions" controlledBy="tab-definitions">
            <LocalAlert variant="info">
              {t('common.status_messages.tab_definitions')}
            </LocalAlert>
          </TabPanel>
          <TabPanel id="pnl-details" controlledBy="tab-details">
            {tableData.data?.metadata && (
              <DetailsTab tableMetadata={tableData.data.metadata} />
            )}
          </TabPanel>
          <TabPanel id="pnl-contact" controlledBy="tab-contact">
            <ContactTab contacts={tableData.data?.metadata.contacts || []} />
          </TabPanel>
        </div>
      </TabsProvider>
    </SheetComponent>
  );
}

export default TableInformation;
