import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';

import styles from './Presentation.module.scss';
import { ContentTop } from '../ContentTop/ContentTop';
import { Table, EmptyState } from '@pxweb2/pxweb2-ui';

import { Content } from '../Content/Content';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';
import React from 'react';

type propsType = {
  selectedNavigationView: string;
  selectedTabId: string;
};

export function Presentation({
  selectedNavigationView,
  selectedTabId,
}: propsType) {
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const variables = useVariables();
  const { pxTableMetadata } = useVariables();
  const { hasLoadedDefaultSelection } = useVariables();
  const { isLoadingMetadata } = useVariables();
  const tableId: string = selectedTabId;
  const label: string = pxTableMetadata?.label ?? '';
  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);
  const [initialRun, SetInitialRun] = useState(true);
  const { selectedVBValues } = useVariables();

  useEffect(() => {
    console.log('PRESENTATION IsLoadingMetadata=' + isLoadingMetadata);
    console.log(
      'PRESENTATION HasLoadedDefaultSelection=' + hasLoadedDefaultSelection
    );

    const hasSelectedValues = variables.getNumberOfSelectedValues() > 0;
    const SelectedValues = variables.getNumberOfSelectedValues() ;


    const hasSelectedMandatoryVariables = pxTableMetadata?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) => selectedVariable.id === variable.id
        )
      );
    // console.log('selectedVBValues xxx=' + JSON.stringify(selectedVBValues))
    // console.log('pxTablemetaData xxx=' + JSON.stringify(pxTableMetadata))
    // console.log('hasSelectedMandatoryVariables xxx=' + hasSelectedMandatoryVariables)
    console.log('PRESENTATION initialRun=' + initialRun)
    console.log('PRESENTATION hasSelectedValues=' + hasSelectedValues)
    console.log('PRESENTATION SelectedValues=' + SelectedValues)
    if (initialRun && !hasSelectedValues) {
      console.log('HAVNER JEG HER!!!!!!!')
      // if (initialRun && !hasLoadetDefaultSelection){ TODO Dette funker jo også
      tableData.fetchTableData(tableId ? tableId : 'tab1292', i18n);
      setIsMissingMandatoryVariables(false);
    } else {
      // console.log('hasSelectedMandatoryVariables YYY='+ hasSelectedMandatoryVariables)
      // console.log('hasLoadetDefaultSelection YYY='+ hasLoadetDefaultSelection)
      // console.log('isLoadingMetadata YYY='+ isLoadingMetadata)
      // console.log('initialRun YYY='+ initialRun)
      if (
        hasSelectedMandatoryVariables &&
        hasLoadedDefaultSelection &&
        !isLoadingMetadata &&
        !initialRun
      ) {
        tableData.fetchTableData(tableId ? tableId : 'tab1292', i18n);
        setIsMissingMandatoryVariables(false);
      }
      if (!hasSelectedMandatoryVariables && !initialRun) {
        setIsMissingMandatoryVariables(true);
      }
      if (initialRun) {
        SetInitialRun(false);
      }
    }
  }, [tableId,selectedVBValues, i18n.resolvedLanguage]);
  return (
    <div className={styles.scrollable}>
      <Content topLeftBorderRadius={selectedNavigationView === 'none'}>
        {tableData.data && pxTableMetadata && (
          <>
            <ContentTop staticTitle={label} pxtable={tableData.data} />

            {(!isMissingMandatoryVariables) && (
              <div className={styles.tableWrapper}>
                <Table pxtable={tableData.data} />
              </div>
            )}

            {!isLoadingMetadata && isMissingMandatoryVariables &&(
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
      </Content>
    </div>
  );
}

export default Presentation;
