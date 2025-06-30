import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import classes from './DrawerSave.module.scss';
import {
  ActionItem,
  BodyShort,
  Button,
  ContentBox,
  Spinner,
  VartypeEnum,
} from '@pxweb2/pxweb2-ui';
import {
  ApiError,
  OutputFormatType,
  VariableSelection,
  VariablesSelection,
} from '@pxweb2/pxweb2-api-client';
import {
  applyTimeFilter,
  createNewSavedQuery,
  createSavedQueryURL,
  exportToFile,
  TimeFilter,
} from '../../../util/export/exportUtil';
import useVariables from '../../../context/useVariables';
import useTableData from '../../../context/useTableData';
import { problemMessage } from '../../../util/problemMessage';

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
  const [sqUrl, setSqUrl] = useState('');

  // If time filter is used when saving query, we need to know the id of the time variable
  const timeVarId = useTableData().data?.metadata.variables.find(
    (v) => v.type === VartypeEnum.TIME_VARIABLE,
  )?.id;

  useEffect(() => {
    if (errorMsg !== '') {
      throw new Error(errorMsg);
    }
  }, [errorMsg]);

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
    setIsLoading(true);

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
        setIsLoading(false);
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
    setIsLoading(true);

    // Create saved query using the export utility
    await createNewSavedQuery(
      tableId,
      i18n.language,
      variablesSelection,
      OutputFormatType.JSON_STAT2,
    )
      .then(
        (id) => {
          // Create saved query URL
          const savedQueryUrl = createSavedQueryURL(id);
          setSqUrl(savedQueryUrl);
        },
        (error) => {
          // Handle error during export
          const err = error as ApiError;
          setErrorMsg(problemMessage(err));
        },
      )
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className={cl(classes.drawerSave)}>
      <ContentBox title={t('presentation_page.sidemenu.save.file.title')}>
        <div>
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.excel')}
            onClick={() => saveToFile(OutputFormatType.XLSX)}
            iconName="FileText"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.csv')}
            onClick={() => saveToFile(OutputFormatType.CSV)}
            iconName="FileText"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.px')}
            onClick={() => saveToFile(OutputFormatType.PX)}
            iconName="FileCode"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.jsonstat2')}
            onClick={() => saveToFile(OutputFormatType.JSON_STAT2)}
            iconName="FileCode"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.html')}
            onClick={() => saveToFile(OutputFormatType.HTML)}
            iconName="FileCode"
          />
          <ActionItem
            ariaLabel={t('presentation_page.sidemenu.save.file.parquet')}
            onClick={() => saveToFile(OutputFormatType.PARQUET)}
            iconName="FileCode"
          />
        </div>
        {isLoading && (
          <div className={classes.loadingSpinner}>
            <Spinner size="xlarge" />
          </div>
        )}
      </ContentBox>
      <ContentBox title="Saved query">
        <Button onClick={() => createSavedQuery()} variant="primary">
          Create saved query (same selection)
        </Button>
        <Button onClick={() => createSavedQuery('from')} variant="primary">
          Create saved query (from)
        </Button>
        <Button onClick={() => createSavedQuery('top')} variant="primary">
          Create saved query (top)
        </Button>
        <BodyShort>{sqUrl}</BodyShort>
      </ContentBox>
    </div>
  );
}
export default DrawerSave;
