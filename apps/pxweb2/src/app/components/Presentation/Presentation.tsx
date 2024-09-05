import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

import styles from './Presentation.module.scss';
import { ContentTop } from '../ContentTop/ContentTop';
import {
  PxTableMetadata,
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
};

export function Presentation({
  pxTablemetaData,
  selectedNavigationView,
  isLoadingMetadata,
}: propsType) {
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const selectedVariables = useVariables();

  // const tableId:string =pxTablemetaData.id;
  const tableId: string = pxTablemetaData?.id ?? '';
  // const label:string=pxTablemetaData.label;
  const label: string = pxTablemetaData?.label ?? '';

  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);

  //const description:string=pxTablemetaData.description ? pxTablemetaData.description: "";

  useEffect(() => {
    let hasSelectedMandatoryVariables = true;
    const mandatoryVariables = pxTablemetaData?.variables.filter(
      (variable) => variable.mandatory
    );

    if (mandatoryVariables) {
      for (const variable of mandatoryVariables) {
        const selected = selectedVariables.getSelectedValuesById(variable.id);
        if (selected.length < 1) {
          hasSelectedMandatoryVariables = false;
        }
      }
    }

    console.log(
      'INNI  USEEFFECT FETCH I PREESENTATION' +
        ' lokal miss mand=' +
        ' missing mand=' +
        isMissingMandatoryVariables +
        '  isloading=' +
        isLoadingMetadata
    );
    // if (!isMissingMandatoryVariables && !isLoadingMetadata) {
    if (hasSelectedMandatoryVariables) {
      tableData.fetchTableData(tableId ? tableId : 'tab638', i18n);

      setIsMissingMandatoryVariables(false);
    }
    if (!hasSelectedMandatoryVariables) {
      setIsMissingMandatoryVariables(true);
    }
  }, [selectedVariables, i18n.resolvedLanguage]);

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
