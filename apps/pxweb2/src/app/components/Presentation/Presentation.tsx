import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import React from 'react';
import isEqual from 'lodash/isEqual';

import styles from './Presentation.module.scss';
import { ContentTop } from '../ContentTop/ContentTop';
import { Table, EmptyState, PxTable } from '@pxweb2/pxweb2-ui';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';
import { useDebounce } from '@uidotdev/usehooks';

type propsType = {
  selectedTabId: string;
};

const MemoizedTable = React.memo(
  function MemoizedTable({ pxtable }: { pxtable: PxTable }) {
    return <Table pxtable={pxtable} />;
  },
  (prevProps, nextProps) => isEqual(prevProps.pxtable, nextProps.pxtable)
);

export function Presentation({ selectedTabId }: propsType) {
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const variables = useDebounce(useVariables(), 500);
  const {
    pxTableMetadata,
    hasLoadedDefaultSelection,
    isLoadingMetadata,
    selectedVBValues,
  } = variables;
  const tableId: string = selectedTabId;
  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);
  const [initialRun, setInitialRun] = useState(true);

  useEffect(() => {
    const hasSelectedValues = variables.getNumberOfSelectedValues() > 0;
    const hasSelectedMandatoryVariables = pxTableMetadata?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) => selectedVariable.id === variable.id
        )
      );

    if (initialRun && !hasSelectedValues) {
      tableData.fetchTableData(tableId || 'tab1292', i18n);
      setIsMissingMandatoryVariables(false);
    } else {
      if (
        hasSelectedMandatoryVariables &&
        hasLoadedDefaultSelection &&
        !isLoadingMetadata &&
        !initialRun
      ) {
        tableData.fetchTableData(tableId || 'tab1292', i18n);
        setIsMissingMandatoryVariables(false);
      }
      if (!hasSelectedMandatoryVariables && !initialRun) {
        setIsMissingMandatoryVariables(true);
      }
      if (initialRun) {
        setInitialRun(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, selectedVBValues, i18n.resolvedLanguage]);

  return (
    <div className={styles.contentContainer}>
      {tableData.data && pxTableMetadata && (
        <>
          <ContentTop
            staticTitle={pxTableMetadata?.label}
            pxtable={tableData.data}
          />
          {!isMissingMandatoryVariables && (
            <div className={styles.tableContainer}>
              <MemoizedTable pxtable={tableData.data} />
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
      )}
    </div>
  );
}

export default Presentation;
