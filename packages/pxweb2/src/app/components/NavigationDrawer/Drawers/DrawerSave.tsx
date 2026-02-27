import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';

import classes from './DrawerSave.module.scss';
import {
  ActionItem,
  Button,
  BodyLong,
  BodyShort,
  ContentBox,
  InformationCard,
  Radio,
  RadioOption,
  VartypeEnum,
  LocalAlert,
} from '@pxweb2/pxweb2-ui';
import {
  ApiError,
  OutputFormatType,
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import useVariables from '../../../context/useVariables';
import useTableData from '../../../context/useTableData';
import { problemMessage } from '../../../util/problemMessage';
import {
  applyTimeFilter,
  createNewSavedQuery,
  createSavedQueryURL,
  exportToFile,
  TimeFilter,
} from '../../../util/export/exportUtil';
import { ApiQuery } from '../../ApiQuery/ApiQuery';
import { fileFormats } from '../../../constants/outputFormats';
export { fileFormats } from '../../../constants/outputFormats';

// File formats moved to shared constants in app/constants/outputFormats

type SaveQueryOptions = 'selected' | 'from' | 'top';
type SaveQueryButtonState = 'create' | 'loading' | 'copy' | 'copied';

type SaveQueryButtonProps = {
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  text?: string;
  onClick?: () => void;
  saveQueryUrl?: string;
};

// Using shared fileFormats

export const SaveQueryCreateButton: React.FC<SaveQueryButtonProps> = ({
  buttonRef,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      ref={buttonRef}
      variant="primary"
      size="medium"
      iconPosition="start"
      icon={'Link'}
      onClick={onClick}
    >
      {t('presentation_page.side_menu.save.savequery.create_button')}
    </Button>
  );
};

export const SaveQueryLoadingButton: React.FC<SaveQueryButtonProps> = ({
  buttonRef,
}) => {
  const { t } = useTranslation();
  return (
    <Button
      ref={buttonRef}
      variant="primary"
      size="medium"
      iconPosition="start"
      loading={true}
      aria-busy={true}
      aria-label={t(
        'presentation_page.side_menu.save.savequery.loading_status',
      )}
    ></Button>
  );
};

export const SaveQueryCopyButton: React.FC<SaveQueryButtonProps> = ({
  buttonRef,
  onClick,
  saveQueryUrl,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        ref={buttonRef}
        variant="primary"
        size="medium"
        icon={'Copy'}
        iconPosition="start"
        onClick={onClick}
      >
        {t('presentation_page.side_menu.save.savequery.copy_button')}
      </Button>
      <BodyShort size="small" className={classes.copyText}>
        {saveQueryUrl}
      </BodyShort>
    </>
  );
};

export const SaveQueryCopiedButton: React.FC<SaveQueryButtonProps> = ({
  buttonRef,
  onClick,
  saveQueryUrl,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Button
        ref={buttonRef}
        variant="primary"
        size="medium"
        iconPosition="start"
        icon={'Check'}
        onClick={onClick}
        aria-label={t('presentation_page.side_menu.save.savequery.copy_button')}
      >
        {t('presentation_page.side_menu.save.savequery.copied_button')}
      </Button>
      <BodyShort size="small" className={classes.copyText}>
        {saveQueryUrl}
      </BodyShort>
    </>
  );
};

const SqScreenReaderStatus: React.FC<{
  queryId: string | null;
  isCopied: boolean;
}> = ({ queryId, isCopied }) => {
  const { t } = useTranslation();
  let createMessage = '';
  let copyMessage = '';

  if (isCopied) {
    copyMessage = t('presentation_page.side_menu.save.savequery.copy_status');
  }

  if (queryId) {
    createMessage = t(
      'presentation_page.side_menu.save.savequery.create_status',
      {
        query: queryId,
      },
    );
  }

  return (
    <>
      <span aria-live="polite" className={classes['sr-only']}>
        {createMessage}
      </span>
      <span aria-live="polite" className={classes['sr-only']}>
        {copyMessage}
      </span>
    </>
  );
};

export type DrawerSaveProps = {
  readonly tableId: string;
};

export function DrawerSave({ tableId }: DrawerSaveProps) {
  const { t, i18n } = useTranslation();
  const variables = useVariables();
  const heading = useTableData().data?.heading;
  const stub = useTableData().data?.stub;
  const [loadingFormat, setLoadingFormat] = useState<OutputFormatType | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState('');

  const [saveQueryUrl, setsaveQueryUrl] = useState('');
  const [showLoadingAnnouncement, setShowLoadingAnnouncement] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [queryId, setQueryId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedRadio, setSelectedRadio] = useState<SaveQueryOptions>('top');
  const [saveQueryButtonState, setSaveQueryButtonState] =
    useState<SaveQueryButtonState>('create');

  const translate = t as unknown as (key: string) => string;

  // If time filter is used when saving query, we need to know the id of the time variable
  const timeVarId = useTableData().data?.metadata.variables.find(
    (v) => v.type === VartypeEnum.TIME_VARIABLE,
  )?.id;

  const loadingBtnRef = useRef<HTMLButtonElement>(null);
  const copyBtnRef = useRef<HTMLButtonElement>(null);
  const copiedBtnRef = useRef<HTMLButtonElement>(null);

  // Focus management effect
  useEffect(() => {
    if (saveQueryButtonState === 'loading') {
      loadingBtnRef.current?.focus();
    } else if (saveQueryButtonState === 'copy') {
      copyBtnRef.current?.focus();
    } else if (saveQueryButtonState === 'copied') {
      copiedBtnRef.current?.focus();
    }
  }, [saveQueryButtonState]);

  useEffect(() => {
    if (errorMsg !== '') {
      throw new Error(errorMsg);
    }
  }, [errorMsg]);

  // Handle loading announcement timer
  useEffect(() => {
    if (loadingFormat) {
      // Start a 5-second timer when loading begins
      loadingTimerRef.current = setTimeout(() => {
        setShowLoadingAnnouncement(true);
      }, 5000);
    } else {
      // Clear the timer and reset announcement when loading stops
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);

        loadingTimerRef.current = null;
      }

      setShowLoadingAnnouncement(false);
    }

    // Cleanup timer on unmount
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [loadingFormat]);

  /**
   * Constructs a VariablesSelection object based on the current variable selections.
   * If a time filter is provided, it modifies the selection for the time variable accordingly.
   *
   * @param {TimeFilter} [timeFilter] - Optional time filter to apply to the time variable selection.
   * @returns {VariablesSelection} - An object containing the current variable selections and their placements.
   */
  function getVariableSelection(timeFilter?: TimeFilter): VariablesSelection {
    const selections: Array<VariableSelection> = [];

    // Get selection from Selection provider
    const ids = variables.getUniqueIds();
    ids.forEach((id) => {
      let valCodes = variables.getSelectedValuesByIdSorted(id);

      // If time filter is used, we need to check if the variable is the time variable
      if (timeFilter && timeVarId && id === timeVarId) {
        valCodes = applyTimeFilter(valCodes, timeFilter);
      }

      const selection: VariableSelection = {
        variableCode: id,
        valueCodes: valCodes,
      };
      const selectedCodeList = variables.getSelectedCodelistById(id);

      // Add selected codelist to selection if it exists
      if (selectedCodeList) {
        selection.codelist = selectedCodeList;
      }

      selections.push(selection);
    });

    const variablesSelection: VariablesSelection = {
      selection: selections,
    };

    // Get stub and heading order from tabledata provider and add to variablesSelection
    if (heading && stub) {
      variablesSelection.placement = {
        heading: heading.map((variable) => variable.id),
        stub: stub ? stub.map((variable) => variable.id) : [],
      };
    } else {
      variablesSelection.placement = {
        heading: [],
        stub: [],
      };
    }

    return variablesSelection;
  }

  /**
   * Saves the current table data to a file in the specified format.
   *
   * @param {OutputFormatType} outputFormat - The format in which to save the file.
   * Supported formats include 'excel', 'csv', 'px', 'jsonstat2', 'html', and 'parquet'.
   * @returns {Promise<void>} - A promise that resolves when the file is saved.
   * Throws an error if the export fails.
   * @throws {ApiError} - If there is an error during the export process.
   * This function uses the export utility to handle the file saving process.
   * It retrieves the current variable selection,
   * sets the loading state,
   * and then calls the export function with the appropriate parameters.
   * The function handles success and error cases,
   * updating the loading state accordingly.
   */
  async function saveToFile(outputFormat: OutputFormatType): Promise<void> {
    const variablesSelection = getVariableSelection();
    setLoadingFormat(outputFormat);

    // Export the file using the export utility
    await exportToFile(tableId, i18n.language, variablesSelection, outputFormat)
      .then(
        () => {
          // Notify user of successful export
        },
        (error) => {
          // Handle error during export
          const err = error as ApiError;
          setErrorMsg(problemMessage(err, tableId));
        },
      )
      .finally(() => {
        setLoadingFormat(null);
      });
  }

  /**
   * Creates a saved query with the current variable selections and time filter.
   * If a time filter is provided, it modifies the selection for the time variable accordingly.
   *
   * @param {TimeFilter} [timeFilter] - Optional time filter to apply to the time variable selection.
   * @returns {Promise<void>} - A promise that resolves when the saved query is created.
   * Throws an error if the creation fails.
   */
  // Note: The timeFilter parameter is optional and can be 'from', 'top', or undefined.
  // If 'from' is used, it will apply the time filter to the first value code.
  // If 'top' is used, it will apply the time filter to the number of value codes.
  // If undefined, it will create a saved query with the current variable selections without any time filter.
  // The function uses the export utility to create the saved query
  // and handles success and error cases, updating the loading state accordingly.
  async function createSavedQuery(timeFilter?: TimeFilter): Promise<void> {
    const variablesSelection = getVariableSelection(timeFilter);

    // Create saved query using the export utility
    await createNewSavedQuery(
      tableId,
      i18n.language,
      variablesSelection,
      OutputFormatType.JSON_STAT2,
    ).then(
      (id) => {
        // Create saved query URL
        const savedQueryUrl = createSavedQueryURL(id);

        setsaveQueryUrl(savedQueryUrl);
        setQueryId(id);
        setSaveQueryButtonState('copy');
      },
      (error) => {
        // Handle error during export
        const err = error as ApiError;
        setErrorMsg(problemMessage(err));
        setSaveQueryButtonState('create');
      },
    );
  }

  const radioOptions: RadioOption[] = [
    {
      value: 'selected',
      label: t(
        'presentation_page.side_menu.save.savequery.period_options.selected',
      ),
    },
    {
      value: 'from',
      label: t(
        'presentation_page.side_menu.save.savequery.period_options.from',
      ),
    },
    {
      value: 'top',
      label: t('presentation_page.side_menu.save.savequery.period_options.top'),
    },
  ];

  function onCreateClick() {
    if (saveQueryButtonState !== 'create') {
      return;
    }

    setSaveQueryButtonState('loading');
    let timeFilter: TimeFilter = 'selected'; // Default to 'selected'

    if (selectedRadio === 'from') {
      timeFilter = 'from';
    } else if (selectedRadio === 'top') {
      timeFilter = 'top';
    }

    createSavedQuery(timeFilter);
  }

  function onCopyClick() {
    if (saveQueryButtonState === 'copy') {
      setSaveQueryButtonState('copied');
    }
    // Copy saveQueryUrl to clipboard
    if (saveQueryUrl) {
      navigator.clipboard
        .writeText(saveQueryUrl)
        .then(() => {
          // Success: show copied status
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 200);
        })
        .catch(() => {
          setErrorMsg('Could not copy url to clipboard.');
        });
    }
  }

  function handleRadioChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSelectedRadio(event.target.value as SaveQueryOptions);
    setSaveQueryButtonState('create');
  }

  return (
    <>
      <ContentBox
        titleDivId="drawer-save-to-file"
        title={t('presentation_page.side_menu.save.file.title')}
      >
        {/* Screen reader announcement for long loading times */}
        <div aria-live="polite" aria-atomic="true" className={classes.srOnly}>
          {showLoadingAnnouncement &&
            loadingFormat &&
            t('presentation_page.side_menu.save.file.loading_announcement')}
        </div>
        <ul
          className={classes.saveAsActionList}
          aria-labelledby="drawer-save-to-file"
        >
          {fileFormats.map((format) => (
            <li key={`saveToFile${format.value}`}>
              <ActionItem
                label={translate(
                  `presentation_page.side_menu.save.file.formats.${format.value}`,
                )}
                onClick={() => saveToFile(format.outputFormat)}
                iconName={format.iconName}
                isLoading={loadingFormat === format.outputFormat}
              />
            </li>
          ))}
        </ul>
        <LocalAlert
          variant="info"
          className={classes.alert + ' ' + classes.file}
        >
          {t('common.status_messages.drawer_save_file')}
        </LocalAlert>
      </ContentBox>
      <ContentBox title={t('presentation_page.side_menu.save.savequery.title')}>
        <div className={classes.informationCardWrapper}>
          <InformationCard icon="LightBulb">
            <BodyLong size="medium">
              {t('presentation_page.side_menu.save.savequery.info')}
            </BodyLong>
          </InformationCard>
        </div>
        <div className={classes.radioGroup}>
          <Radio
            legend={t(
              'presentation_page.side_menu.save.savequery.radio_legend',
            )}
            hideLegend={false}
            options={radioOptions}
            selectedOption={selectedRadio}
            onChange={handleRadioChange}
            name="option"
          />
        </div>
        <div className={classes.buttonWrapper}>
          {saveQueryButtonState === 'create' && (
            <SaveQueryCreateButton onClick={onCreateClick} />
          )}
          {saveQueryButtonState === 'loading' && (
            <SaveQueryLoadingButton buttonRef={loadingBtnRef} />
          )}
          {saveQueryButtonState === 'copy' && (
            <SaveQueryCopyButton
              buttonRef={copyBtnRef}
              onClick={onCopyClick}
              saveQueryUrl={saveQueryUrl}
            />
          )}
          {saveQueryButtonState === 'copied' && (
            <SaveQueryCopiedButton
              buttonRef={copiedBtnRef}
              onClick={onCopyClick}
              saveQueryUrl={saveQueryUrl}
            />
          )}
          <SqScreenReaderStatus queryId={queryId} isCopied={isCopied} />
        </div>
      </ContentBox>
      <ContentBox title={t('presentation_page.side_menu.save.api.query')}>
        <ApiQuery />
      </ContentBox>
    </>
  );
}
export default DrawerSave;
