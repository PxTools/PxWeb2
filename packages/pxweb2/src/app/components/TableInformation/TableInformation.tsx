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
} from '@pxweb2/pxweb2-ui';
import { NotesTab } from './Notes/NotesTab';
import { DefinitionsTab } from './Definitions/DefinitionsTab';
import { Definitions } from 'packages/pxweb2-ui/src/lib/shared-types/definitions';

// const tempMetaidLinksData = {
//   'statistics-homepage': {
//     'dataset-links': [
//       {
//         metaid: 'KORTNAVN:aku',
//         href: 'https://www.ssb.no/befolkning/folketall/statistikk/befolkning',
//         label: 'Statistics homepage',
//         type: 'text/html',
//       },
//     ],
//   },
// };
const tempMetaidLinksDataExtended = {
  // TODO: Do these two links only contain one item each? They are arrays in the temp data
  // which ones should be the "main" link that all tables should have (if they have anything in Definitions)?
  'statistics-homepage': {
    //currently "definisjoner og forklaringer"
    'dataset-links': [
      {
        metaid: 'KORTNAVN:aku',
        href: 'https://www.ssb.no/befolkning/folketall/statistikk/befolkning',
        label: 'Statistics homepage',
        type: 'text/html',
      },
    ],
  },
  'about-statistics': {
    // currently "statistikkside"?
    'dataset-links': [
      {
        metaid: 'KORTNAVN:aku',
        href: 'https://www.ssb.no/befolkning/folketall/statistikk/befolkning#om-statistikken',
        label: 'About the statistics',
        type: 'text/html',
      },
    ],
  },
  definitions: {
    // TODO: Missing a real way to know which dimension/category/variable these are for
    // "Which one is Region"? We need an identifier to link these to the actual variables in the table
    KOKkommuneregion0000: {
      'dimension-links': [
        {
          metaid: 'urn:ssb:classification:klass:231',
          href: 'https://www.ssb.no/klass/klassifikasjoner/231',
          label: 'Classification for region.',
          type: 'text/html',
        },
      ],
    },
    ContentsCode: {
      'category-links': {
        KOSKBDU0000: [
          {
            href: 'https://www.ssb.no/contextvariable/KOSKBDU0000',
            label: 'Korrigerte brutto driftsutgifter  (1000 kr)',
            type: 'text/html',
            metaid:
              'urn:ssb:contextvariable:common:8c42e415-e5dc-4a47-93bf-c9c515b39aa6:104549:KOSKBDU0000',
          },
        ],
        KOSKBDUperelev0000: [
          {
            href: 'https://www.ssb.no/contextvariable/KOSKBDUperelev0000',
            label: 'Korrigerte brutto driftsutgifter per elev (kr)',
            type: 'text/html',
            metaid:
              'urn:ssb:contextvariable:common:8c42e415-e5dc-4a47-93bf-c9c515b39aa6:104549:KOSKBDUperelev0000',
          },
        ],
        KOSKBDUperskyss0000: [
          {
            href: 'https://www.ssb.no/contextvariable/KOSKBDUperskyss0000',
            label:
              'Korrigerte brutto driftsutgifter per elev  som får skoleskyss (223) (kr)',
            type: 'text/html',
            metaid:
              'urn:ssb:contextvariable:common:8c42e415-e5dc-4a47-93bf-c9c515b39aa6:104549:KOSKBDUperskyss0000',
          },
        ],
      },
    },
  },
};

// TODO: Remove TEMPORARY function to map raw JSON definitions data to Definitions type
// when real data is available from API
function mapTableDefinitions(definitionsJson: any) {
  const definitions: Definitions = {};

  definitionsJson['statistics-homepage'] &&
    (definitions.statisticsHomepage =
      definitionsJson['statistics-homepage']['dataset-links'][0] || []);

  definitionsJson['about-statistics'] &&
    (definitions.aboutStatistic =
      definitionsJson['about-statistics']['dataset-links'][0] || []);

  // definitions.definitions = {};

  // Object.keys(definitionsJson.definitions || {}).forEach((dimensionKey) => {
  //   const dimensionData = definitionsJson.definitions[dimensionKey];
  //   const dimensionLinks = dimensionData['dimension-links'] || [];
  //   const categoryLinks = dimensionData['category-links'] || {};

  //   definitions.definitions[dimensionKey] = {
  //     dimensionLinks,
  //     categoryLinks,
  //   };
  // });

  // TODO: Remove temporary logging
  //console.log('Mapped definitions:', definitions);
  return definitions;
}

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
  const metadataOrUndefined = useTableData().data?.metadata;
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

  // TODO: Use real definitions data when available
  //const tmpDefinitions = mapTableDefinitions(tempMetaidLinksData);
  const tmpDefinitions = mapTableDefinitions(tempMetaidLinksDataExtended);

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
            {
              // TODO: Remove checking for temp data when real data is available
              (metadataOrUndefined?.definitions ||
                tmpDefinitions.statisticsHomepage) && (
                <Tab
                  id="tab-definitions"
                  label={t(
                    'presentation_page.main_content.about_table.definitions.panel_title',
                  )}
                  controls="pnl-definitions"
                ></Tab>
              )
            }
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
          {/* TabPanels handle conditional rendering themselves */}
          <TabPanel id="pnl-footnotes" controlledBy="tab-footnotes">
            <NotesTab pxTableMetadata={metadataOrUndefined} />
          </TabPanel>
          <TabPanel id="pnl-definitions" controlledBy="tab-definitions">
            {
              // TODO: Remove checking for temp data when real data is available
              (metadataOrUndefined?.definitions ||
                tmpDefinitions.aboutStatistic) && (
                <DefinitionsTab
                  definitions={
                    tmpDefinitions || metadataOrUndefined?.definitions
                  }
                />
              )
            }
          </TabPanel>
          <TabPanel id="pnl-details" controlledBy="tab-details">
            {metadataOrUndefined && (
              <DetailsTab tableMetadata={metadataOrUndefined} />
            )}
          </TabPanel>
          <TabPanel id="pnl-contact" controlledBy="tab-contact">
            <ContactTab contacts={metadataOrUndefined?.contacts || []} />
          </TabPanel>
        </div>
      </TabsProvider>
    </SheetComponent>
  );
}

export default TableInformation;
