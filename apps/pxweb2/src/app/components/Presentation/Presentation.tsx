import cl from 'clsx';
import classes from './Presentation.module.scss';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import styles from './Presentation.module.scss';
import { ContentTop } from '../ContentTop/ContentTop';
import { Table, EmptyState } from '@pxweb2/pxweb2-ui';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';

type propsType = {
  selectedTabId: string;
};

export function Presentation({ selectedTabId }: propsType) {
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const variables = useVariables();
  const { pxTableMetadata } = useVariables();
  const { hasLoadedDefaultSelection } = useVariables();
  const { isLoadingMetadata } = useVariables();
  const tableId: string = selectedTabId;
  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);
  const [initialRun, SetInitialRun] = useState(true);
  const { selectedVBValues } = useVariables();
  const [isFadingTable, setIsFadingTable] = useState(false);

  useEffect(() => {
    const hasSelectedValues = variables.getNumberOfSelectedValues() > 0;
    const hasSelectedMandatoryVariables = pxTableMetadata?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) => selectedVariable.id === variable.id
        )
      );
    //initial load of data should maybe be done in react-router
    if (initialRun && !hasSelectedValues) {
      tableData.fetchTableData(tableId ? tableId : 'tab1292', i18n);
      setIsMissingMandatoryVariables(false);
    } else {
      if (
        hasSelectedMandatoryVariables &&
        hasLoadedDefaultSelection &&
        !isLoadingMetadata &&
        !initialRun
      ) {
        setIsFadingTable(true);
        tableData.fetchTableData(tableId ? tableId : 'tab638', i18n);
        setIsMissingMandatoryVariables(false);
      }
      if (!hasSelectedMandatoryVariables && !initialRun) {
        setIsMissingMandatoryVariables(true);
      }
      if (initialRun) {
        SetInitialRun(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, selectedVBValues, i18n.resolvedLanguage]);

  useEffect(() => {
    setIsFadingTable(false); // Stop fading once data is loaded
  }, [tableData.data]);

  return (
    <div
      className={cl(classes.contentContainer, {
        [classes.fadeTable]: isFadingTable,
      })}
    >
      {tableData.data && pxTableMetadata && (
        <>
          <ContentTop
            staticTitle={pxTableMetadata?.label}
            pxtable={tableData.data}
          />
          {!isMissingMandatoryVariables && (
            <div
              className={styles.tableContainer}
            >
              <Table pxtable={tableData.data} />
            </div>
          )}

          {!isLoadingMetadata && isMissingMandatoryVariables && (
            <EmptyState
              svgName="ManWithMagnifyingGlass"
              headingTxt={t(
                'presentation_page.main_content.table.warnings.missing_mandatory.title'
              )}
              descriptionTxt={t(
                'presentation_page.main_content.table.warnings.missing_mandatory.description'
              )}
            />
          )}
        </>
      )}{' '}
    </div>
  );
}

export default Presentation;
