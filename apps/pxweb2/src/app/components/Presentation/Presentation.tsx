import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';

import styles from './Presentation.module.scss';
import { ContentTop } from '../ContentTop/ContentTop';
import {
  PxTableMetadata,
  SelectedVBValues,
  Table,
  EmptyState,
  Variable,
} from '@pxweb2/pxweb2-ui';

import { Content } from '../Content/Content';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';
import React from 'react';

type propsType = {
  pxTablemetaData: PxTableMetadata | null;
  selectedNavigationView: string;
  isLoadingMetadata: boolean;
  hasLoadetDefaultSelection: boolean;
  selectedTabId: string;
  selectedVBValues: SelectedVBValues[];
};

export function Presentation({
  pxTablemetaData,
  selectedNavigationView,
  isLoadingMetadata,
  hasLoadetDefaultSelection,
  selectedTabId,
  selectedVBValues,
}: propsType) {
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const variables = useVariables();

  const tableId: string = selectedTabId;
  // const label:string=pxTablemetaData.label;
  const label: string = pxTablemetaData?.label ?? '';

  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);

  const [IsInitialRender, SetInitialRender] = useState(false);

  //const description:string=pxTablemetaData.description ? pxTablemetaData.description: "";
  const initialRender = useRef(true);

  console.log('I PRES TABID=' + pxTablemetaData?.id);
  console.log('I PRES selected tab id=' + selectedTabId);

  useEffect(() => {
    // let hasSelectedMandatoryVariables = true;
    // const mandatoryVariables = pxTablemetaData?.variables.filter(
    //   (variable) => variable.mandatory
    // );

    // if (mandatoryVariables) {
    //   for (const variable of mandatoryVariables) {
    //     const selected = variables.getSelectedValuesById(variable.id);
    //     console.log('Variables ' + selected[0]);
    //     if (selected.length < 1) {
    //       hasSelectedMandatoryVariables = false;
    //     }
    //   }
    // }

    
    const variablesAmount = variables.getNumberOfSelectedValues();
    console.log("variablesAmount=" + variablesAmount);

    console.log(' 1 I IF hasLoadetDefaultSelection=' + hasLoadetDefaultSelection)
    const hasSelectedMandatoryVariables = pxTablemetaData?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) => selectedVariable.id === variable.id
        )
      );

    // if (initialRender.current) {
    //   tableData.fetchTableData(tableId ? tableId : 'tab1292', i18n);
    //   initialRender.current = false;
    // } else {
      console.log('hasLoadetDefaultSelection=' + hasLoadetDefaultSelection)
      if (
        hasSelectedMandatoryVariables &&
        hasLoadetDefaultSelection &&
        !isLoadingMetadata
      ) {
        console.log(' 2 I IF hasLoadetDefaultSelection=' + hasLoadetDefaultSelection)
        tableData.fetchTableData(tableId ? tableId : 'tab1292', i18n);
        setIsMissingMandatoryVariables(false);
      }
    // }
    if (!hasSelectedMandatoryVariables) {
      setIsMissingMandatoryVariables(true);
    }
  }, [variables, i18n.resolvedLanguage]);

  return (
    <div className={styles.scrollable}>
      <Content topLeftBorderRadius={selectedNavigationView === 'none'}>
        {tableData.data && pxTablemetaData && (
          <>
            <ContentTop staticTitle={label} pxtable={tableData.data} />

            {!isMissingMandatoryVariables && (
              <div className={styles.tableWrapper}>
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
      </Content>
    </div>
  );
}

export default Presentation;
