import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import React, { useRef, useEffect, useState } from 'react';
import isEqual from 'lodash/isEqual';

import classes from './Presentation.module.scss';
import useApp from '../../context/useApp';
import { ContentTop } from '../ContentTop/ContentTop';
import { Table, EmptyState, PxTable } from '@pxweb2/pxweb2-ui';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';
import { useDebounce } from '@uidotdev/usehooks';

type propsType = {
  readonly selectedTabId: string;
};

const MemoizedTable = React.memo(
  ({ pxtable, isMobile }: { pxtable: PxTable; isMobile: boolean }) => (
    <Table pxtable={pxtable} isMobile={isMobile} />
  ),
  (prevProps, nextProps) =>
    isEqual(prevProps.pxtable, nextProps.pxtable) &&
    prevProps.isMobile === nextProps.isMobile,
);
export function Presentation({ selectedTabId }: propsType) {
  const { isMobile } = useApp();
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const variablesChanged = useVariables();
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
  const [isFadingTable, setIsFadingTable] = useState(false);

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const gradientContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const checkScrollAndGradient = () => {
      const container = tableContainerRef.current;
      // container to keep the gradient
      const containerGradient = gradientContainerRef.current;
      if (container && containerGradient) {
        // is the table scrollable horisontally?
        // had to substract 3 from scrollwidth. Because of border?
        const needsScroll = container.scrollWidth - 3 > container.clientWidth;
        if (needsScroll) {
          containerGradient.classList.remove(classes.hidegradientRight);
          containerGradient.classList.add(classes.hidegradientLeft);
          //  Check if scrolled to the rightmost side
          // had to substract 3 from scrollwidth. Because of border?
          if (
            container.scrollLeft + container.clientWidth >=
            container.scrollWidth - 3
          ) {
            containerGradient.classList.add(classes.hidegradientRight);
          }
          // scrolled, show left gradient
          if (container.scrollLeft > 0) {
            containerGradient.classList.remove(classes.hidegradientLeft);
          }
        } else {
          containerGradient.classList.add(classes.hidegradientRight);
          containerGradient.classList.add(classes.hidegradientLeft);
        }
      }
    };
    const currentContainer = tableContainerRef.current;
    // Add event listener and initial check to see if gradient should be hiddden or shown
    if (currentContainer) {
      currentContainer.addEventListener('scroll', checkScrollAndGradient);
      checkScrollAndGradient(); // Initial check on mount
    }
    // Add resize event listener to update on window resize
    window.addEventListener('resize', checkScrollAndGradient);

    return () => {
      if (currentContainer) {
        currentContainer.removeEventListener('scroll', checkScrollAndGradient);
      }
    };
  });

  useEffect(() => {
    if (isMobile) {
      tableData.pivotToMobile();
    } else {
      tableData.pivotToDesktop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile]);

  useEffect(() => {
    const hasSelectedValues = variables.getNumberOfSelectedValues() > 0;
    const hasSelectedMandatoryVariables = pxTableMetadata?.variables
      .filter((variable) => variable.mandatory)
      .every((variable) =>
        selectedVBValues.some(
          (selectedVariable) =>
            selectedVariable.id === variable.id &&
            selectedVariable.values.length > 0,
        ),
      );

    if (initialRun && !hasSelectedValues) {
      tableData.fetchTableData(tableId, i18n, isMobile);
      setIsMissingMandatoryVariables(false);
    } else {
      if (
        hasSelectedMandatoryVariables &&
        hasLoadedDefaultSelection &&
        !isLoadingMetadata &&
        !initialRun
      ) {
        setIsFadingTable(true);
        tableData.fetchTableData(tableId, i18n, isMobile);
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

  useEffect(() => {
    setIsFadingTable(true);
  }, [variablesChanged]);

  useEffect(() => {
    setIsFadingTable(false); // Stop fading once data is loaded
  }, [tableData.data, variables]);

  return (
    <main
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
              className={classes.gradientContainer}
              ref={gradientContainerRef}
            >
              <div className={classes.tableContainer} ref={tableContainerRef}>
                <MemoizedTable pxtable={tableData.data} isMobile={isMobile} />
              </div>
            </div>
          )}

          {!isLoadingMetadata && isMissingMandatoryVariables && (
            <EmptyState
              svgName="ManWithMagnifyingGlass"
              headingTxt={t(
                'presentation_page.main_content.table.warnings.missing_mandatory.title',
              )}
              descriptionTxt={t(
                'presentation_page.main_content.table.warnings.missing_mandatory.description',
              )}
            />
          )}
        </>
      )}
    </main>
  );
}

export default Presentation;
