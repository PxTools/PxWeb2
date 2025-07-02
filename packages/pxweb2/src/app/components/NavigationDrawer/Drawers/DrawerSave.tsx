import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import classes from './DrawerSave.module.scss';
import { ActionItem, ContentBox, IconProps, Spinner } from '@pxweb2/pxweb2-ui';
import {
  ApiError,
  VariableSelection,
  VariablesSelection,
} from 'packages/pxweb2-api-client/src';
import { exportToFile } from '../../../util/export/exportUtil';
import useVariables from '../../../context/useVariables';
import useTableData from '../../../context/useTableData';
import { problemMessage } from '../../../util/problemMessage';

interface FileFormat {
  value: string;
  label: string;
  iconName: IconProps['iconName'];
}

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

  const fileFormats: FileFormat[] = [
    {
      value: 'excel',
      label: t('presentation_page.sidemenu.save.file.excel'),
      iconName: 'FileText',
    },
    {
      value: 'csv',
      label: t('presentation_page.sidemenu.save.file.csv'),
      iconName: 'FileText',
    },
    {
      value: 'px',
      label: t('presentation_page.sidemenu.save.file.px'),
      iconName: 'FileCode',
    },
    {
      value: 'jsonstat2',
      label: t('presentation_page.sidemenu.save.file.jsonstat2'),
      iconName: 'FileCode',
    },
    {
      value: 'html',
      label: t('presentation_page.sidemenu.save.file.html'),
      iconName: 'FileCode',
    },
    {
      value: 'parquet',
      label: t('presentation_page.sidemenu.save.file.parquet'),
      iconName: 'FileCode',
    },
  ];

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
      <ContentBox
        titleDivId="drawer-save-to-file"
        title={t('presentation_page.sidemenu.save.file.title')}
      >
        <ul
          className={classes.saveAsActionList}
          role="list"
          aria-labelledby="drawer-save-to-file"
        >
          {fileFormats.map((format) => (
            <li key={`saveToFile${format.value}`}>
              <ActionItem
                ariaLabel={format.label}
                onClick={() => saveToFile(format.value)}
                iconName={format.iconName}
              />
            </li>
          ))}
        </ul>
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
