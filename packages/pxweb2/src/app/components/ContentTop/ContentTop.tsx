import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState, useContext, useEffect, useRef } from 'react';

import classes from './ContentTop.module.scss';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  Heading,
  Icon,
  Link,
  PxTable,
} from '@pxweb2/pxweb2-ui';
import TableInformation from '../TableInformation/TableInformation';
import { AccessibilityContext } from '../../context/AccessibilityProvider';
import {
  getMandatoryNotesCompressed,
  MandatoryCompressedUtilityNotesType,
} from '../../util/notes/notesUtil';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';

export interface ContenetTopProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
}

type NoteMessageType = {
  heading: string;
  message: string;
};

import type { TFunction } from 'i18next';

export function createNoteMessage(
  noteInfo: MandatoryCompressedUtilityNotesType,
  t: TFunction,
): NoteMessageType | null {
  let totalNumberOfVariablesNotes = 0;
  if (noteInfo.variableNotes.length > 0) {
    noteInfo.variableNotes.forEach((variableNote) => {
      totalNumberOfVariablesNotes += variableNote.totalNumberOfNotesOnVariable;
    });
  }
  const totalNumberOfNotes =
    noteInfo.numberOfTableNotes + totalNumberOfVariablesNotes;

  if (totalNumberOfNotes === 0) {
    return null;
  }

  //only table notes
  if (noteInfo.variableNotes.length === 0 && noteInfo.numberOfTableNotes > 0) {
    return {
      heading: t(
        'presentation_page.main_content.about_table.footnotes.mandatory_heading',
      ),
      message: noteInfo.tableNotes,
    };
  }

  // no tablenotes and only variable notes
  if (noteInfo.numberOfTableNotes === 0 && totalNumberOfVariablesNotes === 1) {
    return {
      heading:
        t(
          'presentation_page.main_content.about_table.footnotes.important_about_selection_heading_one_note_1',
        ) +
        totalNumberOfNotes +
        t(
          'presentation_page.main_content.about_table.footnotes.important_about_selection_heading_one_note_2',
        ),
      message: noteInfo.variableNotes[0].compressednotes,
    };
  }

  // other cases e.g. Combination of table notes and variabel/value notes ore multiple variable/value notes
  return {
    heading:
      t(
        'presentation_page.main_content.about_table.footnotes.important_about_selection_heading_1',
      ) +
      totalNumberOfNotes +
      t(
        'presentation_page.main_content.about_table.footnotes.important_about_selection_heading_2',
      ),
    message: t(
      'presentation_page.main_content.about_table.footnotes.important_about_selection_body',
    ),
  };
}

export function ContentTop({ pxtable, staticTitle }: ContenetTopProps) {
  const { t } = useTranslation();
  const [isTableInformationOpen, setIsTableInformationOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');
  const [tableInformationOpener, setTableInformationOpener] = useState('');
  const accessibility = useContext(AccessibilityContext);
  const { pxTableMetadata, selectedVBValues } = useVariables();
  const selectedMetadata = useTableData().data?.metadata;
  const buildTableTitle = useTableData().buildTableTitle;

  const openInformationButtonRef = useRef<HTMLButtonElement>(null);
  const openInformationLinkRef = useRef<HTMLAnchorElement>(null);
  const totalMetadata = pxTableMetadata;
  const openInformationAlertNotesRef = useRef<HTMLDivElement>(null);

  const handleOpenTableInformation = (opener: string, selectedTab?: string) => {
    setTableInformationOpener(opener);
    if (selectedTab) {
      setActiveTab(selectedTab);
    }
    setIsTableInformationOpen(true);
  };
  const noteInfo =
    selectedMetadata && totalMetadata
      ? getMandatoryNotesCompressed(
          selectedMetadata,
          totalMetadata,
          selectedVBValues,
        )
      : undefined;

  let noteMessage;
  if (noteInfo) {
    noteMessage = createNoteMessage(noteInfo, t);
  }

  useEffect(() => {
    if (!isTableInformationOpen) {
      switch (tableInformationOpener) {
        case 'table-information-button':
          openInformationButtonRef.current?.focus();
          break;
        case 'table-information-link':
          openInformationLinkRef.current?.focus();
          break;
        case 'table-information-alertTableNotes':
          openInformationAlertNotesRef.current?.focus();
          break;
        default: {
          break;
        }
      }
    }
    accessibility?.addModal('tableInformation', () => {
      setIsTableInformationOpen(false);
    });
  }, [isTableInformationOpen, tableInformationOpener, accessibility]);

  const { firstTitlePart, lastTitlePart } = buildTableTitle(
    pxtable.stub,
    pxtable.heading,
  );

  // Example title: "Population by region, observations, year and sex"
  const tableTitle = t('presentation_page.main_content.dynamic_table_title', {
    table_content_type: pxtable.metadata.contents,
    table_content_label_first_part: firstTitlePart,
    table_content_label_last_part: lastTitlePart,
  });

  return (
    <>
      <div className={cl(classes[`content-top`])}>
        <nav
          className={cl(classes.breadcrumbs)}
          aria-label={t('presentation_page.main_content.arialabelbreadcrumb')}
        >
          <div className={cl(classes[`breadcrumbs-wrapper`])}>
            <Link href="#" inline>
              <BodyLong>PxWeb 2.0</BodyLong>
            </Link>
            <Icon iconName="ChevronRight"></Icon>
            <BodyLong>{staticTitle}</BodyLong>
          </div>
        </nav>
        <div
          id="px-main-content"
          className={cl(classes[`heading-information`])}
        >
          <Heading level="1" size="large">
            {tableTitle}
          </Heading>
          <div className={cl(classes.information)}>
            <Button
              ref={openInformationButtonRef}
              icon="InformationCircle"
              variant="secondary"
              aria-haspopup="dialog"
              onClick={() => {
                handleOpenTableInformation(
                  'table-information-button',
                  'tab-footnotes',
                );
              }}
            >
              {t('presentation_page.main_content.about_table.title')}
            </Button>
            {pxtable.metadata && (
              <BodyShort size="medium">
                <span className={classes.lastUpdatedLabel}>
                  {t('presentation_page.main_content.last_updated')}:{' '}
                  <Link
                    ref={openInformationLinkRef}
                    href="#"
                    inline
                    aria-haspopup="dialog"
                    onClick={() => {
                      handleOpenTableInformation(
                        'table-information-link',
                        'tab-details',
                      );
                    }}
                  >
                    {t('date.simple_date_with_time', {
                      value: new Date(pxtable.metadata.updated),
                    })}
                  </Link>{' '}
                </span>
              </BodyShort>
            )}
          </div>
        </div>
      </div>
      {noteMessage && (
        <div className={cl(classes.alertgroup)}>
          <Alert
            ref={openInformationAlertNotesRef}
            variant="info"
            heading={noteMessage.heading}
            ariaHasPopup="dialog"
            alertAriaLabel={noteMessage.heading}
            role="button"
            clickable
            onClick={() => {
              handleOpenTableInformation(
                'table-information-alertTableNotes',
                'tab-footnotes',
              );
            }}
          >
            {noteMessage.message}
          </Alert>
        </div>
      )}
      {isTableInformationOpen && (
        <TableInformation
          isOpen={isTableInformationOpen}
          selectedTab={activeTab}
          onClose={() => {
            setIsTableInformationOpen(false);
          }}
        ></TableInformation>
      )}
    </>
  );
}

export default ContentTop;
