import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import isEqual from 'lodash/isEqual';

import classes from './Presentation.module.scss';
import useApp from '../../context/useApp';
import { ContentTop } from '../ContentTop/ContentTop';
import { Table, EmptyState, PxTable, LocalAlert } from '@pxweb2/pxweb2-ui';
import useTableData from '../../context/useTableData';
import useVariables from '../../context/useVariables';
import { useDebounce } from '@uidotdev/usehooks';
import { getConfig } from '../../util/config/getConfig';

type propsType = {
  readonly selectedTabId: string;
  readonly scrollRef?: React.Ref<HTMLDivElement>;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
};

const MemoizedTable = React.memo(
  ({ pxtable, isMobile }: { pxtable: PxTable; isMobile: boolean }) => (
    <Table pxtable={pxtable} isMobile={isMobile} />
  ),
  (prevProps, nextProps) =>
    isEqual(prevProps.pxtable, nextProps.pxtable) &&
    prevProps.isMobile === nextProps.isMobile,
);
export function Presentation({
  selectedTabId,
  scrollRef,
  isExpanded,
  setIsExpanded,
}: Readonly<propsType>) {
  const { isMobile, getSavedQueryId } = useApp();
  const config = getConfig();
  const { i18n, t } = useTranslation();
  const tableData = useTableData();
  const variablesChanged = useVariables();
  const variables = useDebounce(useVariables(), 500);
  const {
    pxTableMetadata,
    hasLoadedInitialSelection,
    isLoadingMetadata,
    selectedVBValues,
  } = variables;
  const tableId: string = selectedTabId;
  const [isMissingMandatoryVariables, setIsMissingMandatoryVariables] =
    useState(false);
  const [initialRun, setInitialRun] = useState(true);
  const { isFadingTable, setIsFadingTable } = tableData;
  const [isMandatoryNotSelectedFirst, setIsMandatoryNotSelectedFirst] =
    useState(true);

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

  const memoizedDataFetch = React.useCallback(() => {
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
      if (getSavedQueryId()?.length > 0) {
        tableData.fetchSavedQuery(getSavedQueryId(), i18n, isMobile);
      } else {
        fetchTableDataIfAllowed();
      }
      setIsMissingMandatoryVariables(false);
    } else {
      if (
        hasSelectedMandatoryVariables &&
        hasLoadedInitialSelection &&
        !isLoadingMetadata &&
        !initialRun
      ) {
        setIsFadingTable(true);
        fetchTableDataIfAllowed();
        setIsMissingMandatoryVariables(false);
      }
      if (!hasSelectedMandatoryVariables && !initialRun) {
        setIsMissingMandatoryVariables(true);
      }
      if (initialRun) {
        setInitialRun(false);
      }
    }
  }, [tableId, selectedVBValues]);

  useEffect(() => {
    memoizedDataFetch();
  }, [memoizedDataFetch]);

  useEffect(() => {
    setIsFadingTable(true);
  }, [variablesChanged]);

  useLayoutEffect(() => {
    // useEffect(() => {
    if (variables.isMatrixSizeAllowed) {
      setIsFadingTable(false); // Stop fading once data is loaded
    }
  }, [tableData.data, variables]);

  function fetchTableDataIfAllowed() {
    if (variables.isMatrixSizeAllowed) {
      tableData.fetchTableData(tableId, i18n, isMobile);
    } else {
      // fade table and give warning
      setIsFadingTable(true);
    }
  }

  useEffect(() => {
    if (isMissingMandatoryVariables) {
      setIsMandatoryNotSelectedFirst(true);
    } else {
      setIsMandatoryNotSelectedFirst(false);
    }
  }, [variables.isMatrixSizeAllowed]);

  useEffect(() => {
    if (!variables.isMatrixSizeAllowed) {
      setIsMandatoryNotSelectedFirst(false);
    }
  }, [isMissingMandatoryVariables]);

  useEffect(() => {
    if (!variables.isMatrixSizeAllowed && !isMandatoryNotSelectedFirst) {
      // Scroll to the top of the page when the Alert is shown
      if (scrollRef && typeof scrollRef !== 'function' && scrollRef.current) {
        scrollRef.current.scrollTo({
          top: 0,
          behavior: 'instant',
        });
      }
    }
  }, [variables.isMatrixSizeAllowed, isMandatoryNotSelectedFirst, scrollRef]);

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
            pathElements={pxTableMetadata?.pathElements ?? []}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />

          {!variables.isMatrixSizeAllowed && !isMandatoryNotSelectedFirst && (
            <div
              role="alert"
              style={{
                width: '100%',
              }}
            >
              <LocalAlert
                variant="warning"
                heading={t(
                  'presentation_page.main_content.table.warnings.to_many_values_selected.title',
                )}
              >
                {' '}
                {t(
                  'presentation_page.main_content.table.warnings.to_many_values_selected.description1',
                )}{' '}
                <strong>
                  {t(
                    'presentation_page.main_content.table.warnings.to_many_values_selected.selectedCells',
                    {
                      selectedCells: t(
                        'number.simple_number_with_zero_decimal',
                        {
                          value: variables.getSelectedMatrixSize(),
                        },
                      ),
                    },
                  )}
                </strong>{' '}
                {t(
                  'presentation_page.main_content.table.warnings.to_many_values_selected.description2',
                )}{' '}
                <strong>
                  {t(
                    'presentation_page.main_content.table.warnings.to_many_values_selected.maxCells',
                    {
                      maxCells: t('number.simple_number_with_zero_decimal', {
                        value: config.maxDataCells,
                      }),
                    },
                  )}
                </strong>{' '}
                {t(
                  'presentation_page.main_content.table.warnings.to_many_values_selected.description3',
                )}{' '}
              </LocalAlert>
            </div>
          )}

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
          {isMissingMandatoryVariables &&
            !variables.isMatrixSizeAllowed &&
            !isMandatoryNotSelectedFirst && (
              <div
                className={classes.gradientContainer}
                ref={gradientContainerRef}
              >
                <div className={classes.tableContainer} ref={tableContainerRef}>
                  <MemoizedTable pxtable={tableData.data} isMobile={isMobile} />
                </div>
              </div>
            )}
          {!isLoadingMetadata &&
            isMissingMandatoryVariables &&
            (variables.isMatrixSizeAllowed || isMandatoryNotSelectedFirst) && (
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
