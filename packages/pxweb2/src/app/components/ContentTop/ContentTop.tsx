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
import { forEach } from 'lodash';

export interface ContenetTopProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
}

type NoteMessageType = {
  heading: string;
  message: string;
  totalNumberOfNotes: number;
};

export function ContentTop({ pxtable, staticTitle }: ContenetTopProps) {
  const { t } = useTranslation();
  const [isTableInformationOpen, setIsTableInformationOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');
  const [tableInformationOpener, setTableInformationOpener] = useState('');
  const accessibility = useContext(AccessibilityContext);
  const openInformationButtonRef = useRef<HTMLButtonElement>(null);
  const openInformationLinkRef = useRef<HTMLAnchorElement>(null);
  const openInformationAlertTableNotesRef = useRef<HTMLDivElement>(null);
  const openInformationAlertVarNotesRef = useRef<Array<HTMLDivElement | null>>(
    [],
  );

  const handleOpenTableInformation = (opener: string, selectedTab?: string) => {
    setTableInformationOpener(opener);
    if (selectedTab) {
      setActiveTab(selectedTab);
    }
    setIsTableInformationOpen(true);
  };

  const { pxTableMetadata, selectedVBValues } = useVariables();
  const totalMetadata = pxTableMetadata;
  const selectedMetadata = useTableData().data?.metadata;
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
    noteMessage = createNoteMessage(noteInfo);
  }

  function createNoteMessage(
    noteInfo: MandatoryCompressedUtilityNotesType,
  ): NoteMessageType | null {
    let totalNumberOfVariablesNotes = 0;
    if (noteInfo.variableNotes.length > 0) {
      forEach(noteInfo.variableNotes, (variableNote) => {
        totalNumberOfVariablesNotes +=
          variableNote.totalNumberOfNotesOnVariable;
      });
    }
    console.log('totalNumberOfVariablesNotes', totalNumberOfVariablesNotes);

    let totalNumberOfNotes =
      noteInfo.numberOfTableNotes + totalNumberOfVariablesNotes;

    if (totalNumberOfNotes === 0) {
      return null;
    }

    if (noteInfo.variableNotes.length === 0) {
      if (noteInfo.numberOfTableNotes > 0) {
        return {
          heading: t(
            'presentation_page.main_content.about_table.notes.important_about_table',
          ),
          message: noteInfo.tableNotes,
          totalNumberOfNotes: noteInfo.numberOfTableNotes,
        };
      }
    }

    //has variableNotes
    if (noteInfo.numberOfTableNotes === 0) {
      // no table notes
      console.log('her??');
      if (totalNumberOfVariablesNotes === 1) {
        console.log('her da??');
        // if (noteInfo.variableNotes.length === 1) {
        //   // and one variable with notes
        //   if (noteInfo.variableNotes[0].totalNumberOfNotesOnVariable === 1) {
        // and only one note on the variable
        return {
          heading:
            t(
              'presentation_page.main_content.about_table.notes.important_about_selection_heading_one_note_1',
            ) +
            totalNumberOfNotes +
            t(
              'presentation_page.main_content.about_table.notes.important_about_selection_heading_one_note_2',
            ),
          message: noteInfo.variableNotes[0].compressednotes,
          totalNumberOfNotes: 1,
        };
        // }
      }
    }

    return {
      heading:
        t(
          'presentation_page.main_content.about_table.notes.important_about_selection_heading_1',
        ) +
        totalNumberOfNotes +
        t(
          'presentation_page.main_content.about_table.notes.important_about_selection_heading_2',
        ),
      message: t(
        'presentation_page.main_content.about_table.notes.important_about_selection_body',
      ),
      totalNumberOfNotes: totalNumberOfNotes,
    };
  }

  // function createNoteMessageX(noteInfo: MandatoryCompressedUtilityNotesType) {
  //   console.log(
  //     'noteInfo.noteInfo.numberOfTableNotes',
  //     noteInfo.numberOfTableNotes,
  //   );
  //   let numberOfVariablesWithNotes = noteInfo.variableNotes.length;

  //   let totalNumberOfNotes = noteInfo.numberOfTableNotes;

  //   forEach(noteInfo.variableNotes, (variableNote) => {
  //     totalNumberOfNotes += variableNote.totalNumberOfNotesOnVariable;
  //   });
  //   let returnMessage: NoteMessage = {
  //     heading: '',
  //     message: '',
  //     totalNumberOfNotes: 0,
  //   };
  //   console.log('totalNumberOfNotes=', totalNumberOfNotes);

  //   if (noteInfo.numberOfTableNotes === 0) {
  //     // no table notes
  //     if (numberOfVariablesWithNotes === 0) {
  //       // no variables with notes
  //       return undefined;
  //     } else if (numberOfVariablesWithNotes === 1) {
  //       // no tableNotes and only one variable with notes
  //       if (noteInfo.variableNotes[0].totalNumberOfNotesOnVariable == 1) {
  //         // only one notes on one variable
  //         // If there is only one note on the variable, we can just return the note text
  //         returnMessage.heading =
  //           t(
  //             'presentation_page.main_content.about_table.notes.important_about_variable',
  //           ) + noteInfo.variableNotes[0].variableName;
  //         returnMessage.message = noteInfo.variableNotes[0].compressednotes;
  //         return returnMessage;
  //       } else {
  //         // no table notes and more than one note on one variable
  //         returnMessage.heading =
  //           t(
  //             'presentation_page.main_content.about_table.notes.important_about_selection_heading_1',
  //           ) +
  //           totalNumberOfNotes +
  //           t(
  //             'presentation_page.main_content.about_table.notes.important_about_selection_heading_2',
  //           );
  //         returnMessage.message = t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_body',
  //         );
  //         returnMessage.message = t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_body',
  //         );
  //       }
  //     } else {
  //       // no table notes and more than one variable with notes
  //       returnMessage.heading =
  //         t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_heading_1',
  //         ) +
  //         totalNumberOfNotes +
  //         t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_heading_2',
  //         );
  //       returnMessage.message = t(
  //         'presentation_page.main_content.about_table.notes.important_about_selection_body',
  //       );
  //       returnMessage.message = t(
  //         'presentation_page.main_content.about_table.notes.important_about_selection_body',
  //       );
  //       return returnMessage;
  //     }
  //   } else if (noteInfo.numberOfTableNotes > 0) {
  //     // only one table note
  //     if (numberOfVariablesWithNotes === 0) {
  //       // only one table note and no variables with notes
  //       returnMessage.heading = t(
  //         'presentation_page.main_content.about_table.notes.important_about_table',
  //       );
  //       returnMessage.message = noteInfo.tableNotes;
  //       return returnMessage;
  //     } else {
  //       // only one table note and one or more variables with notes
  //       returnMessage.heading =
  //         t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_heading_1',
  //         ) +
  //         totalNumberOfNotes +
  //         t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_heading_2',
  //         );
  //       returnMessage.message = t(
  //         'presentation_page.main_content.about_table.notes.important_about_selection_body',
  //       );
  //       return returnMessage;
  //     }
  //   } else {
  //     // more than 1 table note
  //     if (numberOfVariablesWithNotes === 0) {
  //       // more than one table note and no variables with notes
  //       returnMessage.heading = returnMessage.heading = t(
  //         'presentation_page.main_content.about_table.notes.important_about_table',
  //       );
  //       returnMessage.message = noteInfo.tableNotes;
  //       returnMessage.totalNumberOfNotes = totalNumberOfNotes;
  //       return returnMessage;
  //     } else {
  //       // more than one table note and one or more variables with notes
  //       returnMessage.heading =
  //         t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_heading_1',
  //         ) +
  //         totalNumberOfNotes +
  //         t(
  //           'presentation_page.main_content.about_table.notes.important_about_selection_heading_2',
  //         );
  //       returnMessage.message = t(
  //         'presentation_page.main_content.about_table.notes.important_about_selection_body',
  //       );
  //       returnMessage.totalNumberOfNotes = totalNumberOfNotes;
  //       return returnMessage;
  //     }
  //   }
  // }

  useEffect(() => {
    if (!isTableInformationOpen) {
      const alertVarNotesRegex = /^table-information-alertVarNotes-(\d+)$/;
      const execResult = alertVarNotesRegex.exec(tableInformationOpener ?? '');
      switch (tableInformationOpener) {
        case 'table-information-button':
          openInformationButtonRef.current?.focus();
          break;
        case 'table-information-link':
          openInformationLinkRef.current?.focus();
          break;
        case 'table-information-alertTableNotes':
          openInformationAlertTableNotesRef.current?.focus();
          break;
        default: {
          if (execResult) {
            // Extract the index from the regex result
            const idx = Number(execResult[1] ?? 0);
            openInformationAlertVarNotesRef.current?.[idx]?.focus();
          }
          break;
        }
      }
    }
    accessibility?.addModal('tableInformation', () => {
      setIsTableInformationOpen(false);
    });
  }, [isTableInformationOpen, tableInformationOpener, accessibility]);

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
            {pxtable.metadata.label}
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
        <div className={cl(classes.alertgroup)}>
          {noteMessage && (
            <Alert
              ref={openInformationAlertTableNotesRef}
              variant="info"
              heading={noteMessage.heading}
              ariaHasPopup="dialog"
              alertAriaLabel={t(
                'presentation_page.main_content.about_table.notes.important_about_table',
              )}
              role="button"
              clickButtonAriaLabel={t(
                'presentation_page.main_content.about_table.notes.important_about_table',
              )}
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
          )}
          {/* {noteInfo?.variableNotes?.map((note, idx) => (
            <Alert
              ref={(el) => {
                openInformationAlertVarNotesRef.current[idx] = el;
              }}
              key={note?.variableName ?? idx}
              variant="info"
              clickable
              onClick={() => {
                handleOpenTableInformation(
                  `table-information-alertVarNotes-${idx}`,
                  'tab-footnotes',
                );
              }}
              heading={
                t(
                  'presentation_page.main_content.about_table.notes.important_about_variable',
                ) + note?.variableName
              }
            >
              {note?.compressednotes}
            </Alert>
          ))} */}
        </div>
      </div>
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
