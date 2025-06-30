import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';

import classes from './DrawerSave.module.scss';
import {
  ActionItem,
  ContentBox,
  Spinner,
  InformationCard,
  Radio,
  RadioOption,
  Button,
  BodyLong,
  BodyShort,
} from '@pxweb2/pxweb2-ui';
import {
  ApiError,
  VariableSelection,
  VariablesSelection,
} from 'packages/pxweb2-api-client/src';
import { exportToFile } from '../../../util/export/exportUtil';
import useVariables from '../../../context/useVariables';
import useTableData from '../../../context/useTableData';
import { problemMessage } from '../../../util/problemMessage';

type SaveQueryOptions = 'selected' | 'from' | 'top';
type SaveQueryButtonState = 'create' | 'loading' | 'copy' | 'copied';

type SaveQueryButtonProps = {
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  text?: string;
  onClick?: () => void;
  saveQueryUrl?: string;
};

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
      iconPosition="left"
      icon={'Link'}
      onClick={onClick}
    >
      {t('presentation_page.sidemenu.save.savequery.createButton')}
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
      iconPosition="left"
      loading={true}
      aria-busy={true}
      aria-label={t('presentation_page.sidemenu.save.savequery.loadingStatus')}
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
        icon={'Link'}
        onClick={onClick}
      >
        {t('presentation_page.sidemenu.save.savequery.copyButton')}
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
        iconPosition="left"
        icon={'CheckMark'}
        onClick={onClick}
        aria-label={t('presentation_page.sidemenu.save.savequery.copyButton')}
      >
        {t('presentation_page.sidemenu.save.savequery.copiedButton')}
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
  saveQueryUrl: string;
}> = ({ queryId, isCopied, saveQueryUrl }) => {
  const { t } = useTranslation();
  let createMessage = '';
  let copyMessage = '';

  if (isCopied) {
    copyMessage = t('presentation_page.sidemenu.save.savequery.copyStatus', {
      url: saveQueryUrl,
    });
  }

  if (queryId) {
    createMessage = t(
      'presentation_page.sidemenu.save.savequery.createStatus',
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedRadio, setSelectedRadio] =
    useState<SaveQueryOptions>('selected');
  const [saveQueryButtonState, setSaveQueryButtonState] =
    useState<SaveQueryButtonState>('create');
  const [saveQueryUrl, setsaveQueryUrl] = useState(
    'https://thisismybeautifulpxsqurl.com/query?',
  );
  const [queryId, setQueryId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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

  function getVariableSelection(): VariablesSelection {
    const selections: Array<VariableSelection> = [];

    // Get selection from Selection provider
    const ids = variables.getUniqueIds();
    ids.forEach((id) => {
      const selectedCodeList = variables.getSelectedCodelistById(id);
      const selection: VariableSelection = {
        variableCode: id,
        valueCodes: variables.getSelectedValuesByIdSorted(id),
      };

      // Add selected codelist to selection if it exists
      if (selectedCodeList) {
        selection.codeList = selectedCodeList;
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

  async function saveToFile(fileFormat: string): Promise<void> {
    const variablesSelection = getVariableSelection();
    setIsLoading(true);

    // Export the file using the export utility
    await exportToFile(tableId, i18n.language, variablesSelection, fileFormat)
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
        setIsLoading(false);
      });
  }

  const radioOptions: RadioOption[] = [
    {
      value: 'selected',
      label: t(
        'presentation_page.sidemenu.save.savequery.periodOptions.selected',
      ),
    },
    {
      value: 'from',
      label: t('presentation_page.sidemenu.save.savequery.periodOptions.from'),
    },
    {
      value: 'top',
      label: t('presentation_page.sidemenu.save.savequery.periodOptions.top'),
    },
  ];

  function generateRandomQueryId(): string {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    // Ensure 6 digits, pad with zeros if needed
    return (array[0] % 1000000).toString().padStart(6, '0');
  }

  function onCreateClick() {
    if (saveQueryButtonState !== 'create') {
      return;
    }

    setSaveQueryButtonState('loading');
    setTimeout(() => {
      // Simulate API call to create a query
      const newId = generateRandomQueryId();
      setQueryId(newId);
      setsaveQueryUrl(
        `https://thisismybeautifulpxsqurl.com/query?queryId=${newId}`,
      );
      setSaveQueryButtonState('copy');
    }, 2000);
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
    <div className={cl(classes.drawerSave)}>
      <ContentBox title={t('presentation_page.sidemenu.save.file.title')}>
        <div>
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.excel')}
            onClick={() => saveToFile('excel')}
            iconName="FileText"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.csv')}
            onClick={() => saveToFile('csv')}
            iconName="FileText"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.px')}
            onClick={() => saveToFile('px')}
            iconName="FileCode"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.jsonstat2')}
            onClick={() => saveToFile('jsonstat2')}
            iconName="FileCode"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.html')}
            onClick={() => saveToFile('html')}
            iconName="FileCode"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.parquet')}
            onClick={() => saveToFile('parquet')}
            iconName="FileCode"
          />
        </div>
        {isLoading && (
          <div className={classes.loadingSpinner}>
            <Spinner size="xlarge" />
          </div>
        )}
      </ContentBox>
      <ContentBox title={t('presentation_page.sidemenu.save.savequery.title')}>
        <div className={classes.informationCardWrapper}>
          <InformationCard icon="InformationCircle">
            <BodyLong size="medium">
              {t('presentation_page.sidemenu.save.savequery.info')}
            </BodyLong>
          </InformationCard>
        </div>
        <div className={classes.radioGroup}>
          <Radio
            legend={t('presentation_page.sidemenu.save.savequery.radioLegend')}
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
          <SqScreenReaderStatus
            queryId={queryId}
            isCopied={isCopied}
            saveQueryUrl={saveQueryUrl}
          />
        </div>
      </ContentBox>
    </div>
  );
}
export default DrawerSave;
