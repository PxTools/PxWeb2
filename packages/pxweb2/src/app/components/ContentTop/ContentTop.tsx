import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

import classes from './ContentTop.module.scss';
import {
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Icon,
  Link,
  SideSheet,
  PxTable,
  TabsProvider,
  Tabs,
  Tab,
  TabPanel,
} from '@pxweb2/pxweb2-ui';

export interface ContenetTopProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
}

export function ContentTop({ pxtable, staticTitle }: ContenetTopProps) {
  const { t } = useTranslation();
  const [isSideSheetOpen, setIsSideSheetOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('px-tab1');

  const handleOpenSideSheet = () => {
    setIsSideSheetOpen(true);
  };

  return (
    <>
      <div className={cl(classes[`content-top`])}>
        <div className={cl(classes.breadcrumbs)}>
          <div className={cl(classes[`breadcrumbs-wrapper`])}>
            <Link href="#" inline>
              <BodyLong>PxWeb 2.0</BodyLong>
            </Link>
            <Icon iconName="ChevronRight"></Icon>
            <BodyLong>{staticTitle}</BodyLong>
          </div>
        </div>
        <div
          id="px-main-content"
          className={cl(classes[`heading-information`])}
        >
          <Heading level="1" size="large">
            {pxtable.metadata.label}
          </Heading>
          <div className={cl(classes.information)}>
            <Button
              icon="InformationCircle"
              variant="secondary"
              onClick={() => {
                handleOpenSideSheet();
              }}
            >
              {t(
                'presentation_page.main_content.about_table.information.title',
              )}
            </Button>
            {pxtable.metadata && (
              <BodyShort size="medium">
                <span className={classes.lastUpdatedLabel}>
                  {t('presentation_page.main_content.last_updated')}:{' '}
                  {t('date.simple_date_with_time', {
                    value: new Date(pxtable.metadata.updated),
                  })}{' '}
                </span>
              </BodyShort>
            )}
          </div>
        </div>
      </div>
      {isSideSheetOpen && (
        <SideSheet
          heading="Information"
          isOpen={true}
          onClose={() => {
            setIsSideSheetOpen(false);
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
              <Tab
                id="tab-details"
                label="Details"
                controls="pnl-details"
              ></Tab>
              <Tab
                id="tab-contact"
                label="Contact"
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
      )}
    </>
  );
}

export default ContentTop;
