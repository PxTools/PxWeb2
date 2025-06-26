import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import classes from './DrawerSave.module.scss';
import { ActionItem, ContentBox, Spinner } from '@pxweb2/pxweb2-ui';
import {
  ApiError,
  VariableSelection,
  VariablesSelection,
} from 'packages/pxweb2-api-client/src';
import { exportToFile } from '../../../util/export/exportUtil';
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
    </div>
  );
}
export default DrawerSave;
