import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useState, useContext, useEffect, useRef } from 'react';
import classes from './ContentTop.module.scss';
import {
  Alert,
  BodyShort,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Heading,
  PxTable,
  PathElement,
} from '@pxweb2/pxweb2-ui';
import TableInformation from '../TableInformation/TableInformation';
import { AccessibilityContext } from '../../context/AccessibilityProvider';
import {
  getMandatoryNotesCompressed,
  MandatoryCompressedUtilityNotesType,
} from '../../util/notes/notesUtil';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';
import useApp from '../../context/useApp';
import { useLocation } from 'react-router';

export interface ContenetTopProps {
  readonly pxtable: PxTable;
  readonly staticTitle: string;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  readonly pathElements: PathElement[];
}

type NoteMessageType = {
  heading: string;
  message: string;
};

import type { TFunction, i18n } from 'i18next';
import { getPathWithUniqueIds } from '../../util/pathUtil';
import { getConfig } from '../../util/config/getConfig';

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

export function ContentTop({
  pxtable,
  staticTitle,
  isExpanded,
  setIsExpanded,
  pathElements,
}: Readonly<ContenetTopProps>) {
  const { t, i18n } = useTranslation();
  const [isTableInformationOpen, setIsTableInformationOpen] =
    useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('');
  const [tableInformationOpener, setTableInformationOpener] = useState('');
  const accessibility = useContext(AccessibilityContext);
  const { pxTableMetadata, selectedVBValues } = useVariables();
  const selectedMetadata = useTableData().data?.metadata;
  const buildTableTitle = useTableData().buildTableTitle;
  const { setTitle, isXXLargeDesktop, isTablet } = useApp();

  const openInformationButtonRef = useRef<HTMLButtonElement>(null);
  const openInformationLinkRef = useRef<HTMLAnchorElement>(null);
  const totalMetadata = pxTableMetadata;
  const openInformationAlertNotesRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

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

  useEffect(() => {
    setTitle(staticTitle);
  }, [staticTitle, setTitle]);

  function getBreadcrumbItems(
    pathElements: PathElement[],
    staticTitle: string,
    i18n: i18n,
  ): BreadcrumbItem[] {
    const breadcrumbItems: BreadcrumbItem[] = [];
    const pathWithUniqueIds = getPathWithUniqueIds(pathElements);
    const config = getConfig();
    const language = i18n.language;
    const showLangInPath =
      config.language.showDefaultLanguageInPath ||
      language !== config.language.defaultLanguage;
    const langPrefix = showLangInPath ? `${language}` : '';
    const basePath = config.baseApplicationPath || '';

    breadcrumbItems.push({
      label: t('common.breadcrumbs.breadcrumb_root_title'),
      href: basePath + langPrefix,
    });

    if (pathElements && pathElements.length > 0) {
      breadcrumbItems.push(
        ...pathWithUniqueIds.map((path) => ({
          label: path.label,
          href: `${basePath}${langPrefix}?subject=${path.uniqueId}`,
        })),
      );
    }

    breadcrumbItems.push({
      label: staticTitle,
      href:
        basePath + location.pathname.startsWith('/')
          ? location.pathname.substring(1)
          : location.pathname + location.search + location.hash,
    });

    return breadcrumbItems;
  }

  const breadcrumbItems = getBreadcrumbItems(pathElements, staticTitle, i18n);

  const breadcrumbsVariant = isTablet ? 'compact' : 'default';

  return (
    <>
      <div className={cl(classes[`content-top`])}>
        <Breadcrumbs
          variant={breadcrumbsVariant}
          breadcrumbItems={breadcrumbItems}
        />
        {isXXLargeDesktop && (
          <Button
            size="medium"
            icon={isExpanded ? 'ShrinkHorizontal' : 'ExpandHorizontal'}
            variant="tertiary"
            className={cl(classes[`resize`])}
            title={
              isExpanded
                ? t('presentation_page.main_content.shrink_view')
                : t('presentation_page.main_content.expand_view')
            }
            onClick={() => setIsExpanded(!isExpanded)}
          ></Button>
        )}
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
                  {t('date.simple_date_with_time', {
                    value: new Date(pxtable.metadata.updated),
                  })}
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
