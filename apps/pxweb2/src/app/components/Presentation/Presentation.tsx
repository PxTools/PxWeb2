import cl from 'clsx';
import classes from './Presentation.module.scss';
import { useTranslation } from 'react-i18next';
import { useEffect, useState,useRef } from 'react';
import { useLoaderData } from 'react-router-dom';

import styles from './Presentation.module.scss';
import { ContentTop } from '../ContentTop/ContentTop';
import { Table, EmptyState, Spinner } from '@pxweb2/pxweb2-ui';
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

  const{isLoadingTable,setIsLoadingTable,isFadingTable,setIsFadingTable}= useVariables();

  //const [IsLoadingData, setIsLoadingData] = useState(false);
  //const [IsFadingTable, setIsFadingTable] = useState(true);

  const [hasFinishedInitialDataLoad, setHasFinishedInitialDataLoad] =
    useState(false);

  // const [tableIsReady, setTableIsReady] =
  // useState(false);
  let spinnerTimer: ReturnType<typeof setTimeout>;
  const loadingTimer = useRef<NodeJS.Timeout |undefined>(undefined);
  const { tableDataFromLoader } = useLoaderData() as any;

  // let spinnerTimer:ReturnType<typeof setTimeout>;
  useEffect(() => {
   // variables.setTableIsReady(true); //could be local?
    setIsLoadingTable(true);
    setIsFadingTable(false);
    // const spinnerTimer = setTimeout(() => {
    //   setIsLoadingData(true); // Show spinner after 6 seconds
    //   setIsFadingTable(false); // Stop fading since spinner will be shown
    // }, 6000);
    // variables.setTableIsReady(false); //could be local?
    if (!tableDataFromLoader && !hasFinishedInitialDataLoad) {
      // TODO: Is this correct?
      return;
    }

    tableData.setTableData(tableDataFromLoader);
    setHasFinishedInitialDataLoad(true);
    //clearTimeout(timer); // Clear the timer if data comes in before 6 seconds

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // clearTimeout(spinnerTimer); // Clear spinner timeout if data arrives in less than 6 seconds
  }, [tableDataFromLoader]);


  useEffect(() => {
    if (!hasFinishedInitialDataLoad) {
      return;
    }

    const hasSelectedMandatoryVariables = pxTableMetadata?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) => selectedVariable.id === variable.id
        )
      );

    if (hasSelectedMandatoryVariables) {
     // setIsLoadingTable(false);
     // setIsFadingTable(true);
 //     console.log ('Spinner 1 = ' + JSON.stringify(loadingTimer.current))
      loadingTimer.current = setTimeout(() => {
        setIsLoadingTable(true); // Show spinner after 6 seconds
        setIsFadingTable(false); // Stop fading since spinner will be shown
      }, 2000);
      // variables.setTableIsReady(false);
      tableData.fetchTableData(tableId ? tableId : 'tab638', i18n);
    
   //  console.log ('Spinner 2 = ' + JSON.stringify(loadingTimer.current))
      // clearTimeout(spinnerTimer); // Clear spinner timeout if data arrives in less than 6 seconds
     // console.log ('Spinner 3 = ' + JSON.stringify(loadingTimer.current))
      setIsMissingMandatoryVariables(false);
    }
    if (!hasSelectedMandatoryVariables) {
      setIsMissingMandatoryVariables(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVBValues, i18n.resolvedLanguage]); // Should only run this useEffect when selectedVBValues are in sync with variables context

  useEffect(() => {
    //variables.setTableIsReady(true);
    setIsFadingTable(false); // Stop fading once data is loaded
    setIsLoadingTable(false); // Hide spinner since data has arrived
    //console.log ('Spinner 4 = ' + JSON.stringify(loadingTimer.current))
    clearTimeout(loadingTimer.current); // Clear spinner timeout if data arrives in less than 6 seconds
    loadingTimer.current = undefined;
    //console.log ('Spinner 5= ' + JSON.stringify(loadingTimer.current))
  }, [tableData.data]); 

  return (
    // <div  className={cl(classes.contentContainer,{[classes.fadeTable]: !variables.tableIsReady })}>
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
            <div className={styles.tableContainer} style={{ position: 'relative' }}>
              <Table pxtable={tableData.data} />
              {isLoadingTable && (
                <div className={cl(classes.loading)} //not working??
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent background
                    zIndex: 1, // Make sure spinner is above the table
                  }}
                >
                  <Spinner  label='Vennligst vent' />
                </div>
              )}
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
