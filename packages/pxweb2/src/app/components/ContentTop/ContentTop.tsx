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
import { getMandatoryNotesCompressed } from '../../util/notes/notesUtil';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';

export interface ContenetTopProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
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
  const openInformationAlertTableNotesRef = useRef<HTMLDivElement>(null);
  const openInformationAlertVarNotesRef = useRef<Array<HTMLDivElement | null>>(
    [],
  );
  const totalMetadata = pxTableMetadata;

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
        <div className={cl(classes.alertgroup)}>
          {noteInfo?.tableNotes && (
            <Alert
              ref={openInformationAlertTableNotesRef}
              variant="info"
              heading={t(
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
              {noteInfo.tableNotes}
            </Alert>
          )}
          {noteInfo?.variableNotes?.map((note, idx) => (
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
          ))}
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
