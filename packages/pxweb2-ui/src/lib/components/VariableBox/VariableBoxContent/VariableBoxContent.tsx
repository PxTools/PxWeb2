import { useEffect, useRef, useState, useMemo } from 'react';
import cl from 'clsx';
import { useTranslation, Trans } from 'react-i18next';
import { useDebounce } from '@uidotdev/usehooks';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import deburr from 'lodash/deburr';
import { v4 as uuidv4 } from 'uuid';

import classes from './VariableBoxContent.module.scss';
import { Checkbox, MixedCheckbox } from '../../Checkbox/Checkbox';
import Search, { SearchHandle } from '../../Search/Search';
import { Select } from '../../Select/Select';
import { SelectOption } from '../../Select/SelectOptionType';
import { VariableBoxProps, SelectedVBValues } from '../VariableBox';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import { Value } from '../../../shared-types/value';
import Skeleton from '../../Skeleton/Skeleton';
import { mapAndSortCodeLists } from '../utils';
import { BodyShort } from '../../Typography/BodyShort/BodyShort';
import Heading from '../../Typography/Heading/Heading';

const ScrollSeekPlaceholder = () => (
  <Skeleton
    aria-label="placeholder"
    height={'25px'}
    width={50 + Math.ceil(Math.random() * 15) + '%'}
  />
);

type VariableBoxPropsToContent = Omit<
  VariableBoxProps,
  'id' | 'mandatory' | 'tableId'
>;

type VariableBoxContentProps = VariableBoxPropsToContent & {
  varId: string;
  selectedValues: SelectedVBValues[];
  totalValues: number;
  totalChosenValues: number;
  languageDirection: 'ltr' | 'rtl';
  onChangeCodeList: (selectedItem: SelectOption, varId: string) => void;
  onChangeCheckbox: (varId: string, value: string) => void;
  onChangeMixedCheckbox: (
    varId: string,
    allValuesSelected: string,
    searchValues: Value[],
  ) => void;
  addModal: (name: string, closeFunction: () => void) => void;
  removeModal: (name: string) => void;
};

type VirtualListItem = {
  type: string;
  value?: Value;
};

export function VariableBoxContent({
  varId,
  label,
  languageDirection,
  type,
  values,
  codeLists,
  selectedValues,
  totalValues,
  totalChosenValues,
  onChangeCodeList,
  onChangeCheckbox,
  onChangeMixedCheckbox,
  addModal,
  removeModal,
}: VariableBoxContentProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState<string>('');
  const [allValuesSelected, setAllValuesSelected] = useState<
    'mixed' | 'true' | 'false'
  >('mixed');

  const debouncedSearch = useDebounce(search, 300);
  const [items, setItems] = useState<VirtualListItem[]>([]);
  const [uniqueId] = useState(() => uuidv4());
  const valuesOnlyList = useRef<HTMLDivElement>(null);
  const hasCodeLists = codeLists && codeLists.length > 0;
  const hasSevenOrMoreValues = values && values.length > 6;
  const [initiallyHadSevenOrMoreValues] = useState(hasSevenOrMoreValues);
  const hasTwoOrMoreValues = values && values.length > 1;
  const hasSelectAndSearch = hasCodeLists && hasSevenOrMoreValues;
  const valuesToRender = structuredClone(values);
  const codeListLabelId = 'codelist-label-' + uniqueId;

  const searchedValues: Value[] = values.filter(
    (value) =>
      deburr(value.label)
        .toLowerCase()
        .indexOf(deburr(debouncedSearch).toLowerCase()) > -1,
  );
  const selectedValuesForVar = useMemo(() => {
    return (
      selectedValues
        .find((variables) => variables.id === varId)
        ?.values.sort() || []
    );
  }, [selectedValues, varId]);

  // The API always returns the oldest values first,
  // so we can just reverse the values array when the type is TIME_VARIABLE
  if (type === VartypeEnum.TIME_VARIABLE) {
    valuesToRender.reverse();
  }

  const searchRef = useRef<SearchHandle>(null);
  const lastInteractionWasPointer = useRef(false);

  // Screen reader announcement count – updates on every raw search change or values mutation (not just debounced result)
  const [searchResultsCount, setSearchResultsCount] = useState(
    () => values.length,
  );

  // Recalculate count whenever user types (raw search) or underlying values array changes
  useEffect(() => {
    const norm = deburr(search).toLowerCase();
    const nextCount = values.filter((v) =>
      deburr(v.label).toLowerCase().includes(norm),
    ).length;
    setSearchResultsCount(nextCount);
  }, [search, values]);

  const debouncedSearchResultsCount = useDebounce(searchResultsCount, 700);
  const renderNumberofTablesScreenReader = () => {
    if (searchResultsCount < 1) {
      return null;
    }
     return (
      <span className={classes['sr-only']} aria-live="polite" aria-atomic="true">
        <Trans
          i18nKey={
            debouncedSearchResultsCount === 1
              ? 'presentation_page.side_menu.selection.variablebox.content.values_list.showing_number_of_one_value'
              : 'presentation_page.side_menu.selection.variablebox.content.values_list.showing_number_of_values'
          }
          values={{ searchResultsCount: debouncedSearchResultsCount }}
          //values={{ searchResultsCount: searchResultsCount }}
        />
      </span>
    );
  };

  useEffect(() => {
    const newItems: VirtualListItem[] = [];

    if (!valuesToRender || valuesToRender.length === 0) {
      return;
    }

    if (hasSevenOrMoreValues) {
      newItems.push({ type: 'search' });
    }

    if (
      hasTwoOrMoreValues &&
      (searchedValues.length === 0 || searchedValues.length > 1)
    ) {
      newItems.push({ type: 'mixedCheckbox' });
    }

    valuesToRender
      .filter(
        (value) =>
          deburr(value.label)
            .toLowerCase()
            .indexOf(deburr(debouncedSearch).toLowerCase()) > -1,
      )
      .forEach((value) => {
        newItems.push({ type: 'value', value });
      });

    setItems(newItems);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSevenOrMoreValues, hasTwoOrMoreValues, debouncedSearch, values]);

  // Function to compare the searched values with the chosen values
  function compareSearchedAndChosenValues(
    searchedValues: string | Value[],
    chosenValues: string | string[],
  ): 'mixed' | 'none' | 'all' {
    const compareArrays = Array.isArray(searchedValues)
      ? searchedValues
          .map((searchedValue) => searchedValue.code)
          .filter((value: string) => chosenValues.includes(value))
      : [];
    if (compareArrays.length === 0) {
      return 'none';
    } else if (compareArrays.length === searchedValues.length) {
      return 'all';
    } else {
      return 'mixed';
    }
  }

  useEffect(() => {
    const searcedResult = compareSearchedAndChosenValues(
      searchedValues,
      selectedValuesForVar,
    );

    if (
      // If no values are chosen and no values are searched for
      (totalChosenValues === 0 && searchedValues.length === 0) ||
      // If there are searched values and searched and chosen values do not match
      (searchedValues.length > 0 && searcedResult === 'none')
    ) {
      setAllValuesSelected('false');
    } else if (
      // If some values are chosen and no values are searched for

      (totalChosenValues > 0 &&
        totalChosenValues < totalValues &&
        searchedValues.length === 0) ||
      // If some values are chosen and some values are searched for and they do match
      (searchedValues.length > 0 && searcedResult === 'mixed')
    ) {
      setAllValuesSelected('mixed');
    } else if (
      // If all values are chosen and no values are searched for
      (totalChosenValues === totalValues && searchedValues.length === 0) ||
      // If all values chosen and matching searched values
      (searchedValues.length > 0 && searcedResult === 'all')
    ) {
      setAllValuesSelected('true');
    }
  }, [totalChosenValues, totalValues, searchedValues, selectedValuesForVar]);

  const mappedAndSortedCodeLists: SelectOption[] =
    mapAndSortCodeLists(codeLists);

  // needs the selected, mapped code list for the current variable
  const currentVarSelectedCodeListId = selectedValues.find(
    (variable) => variable.id === varId,
  )?.selectedCodeList;
  const selectedCodeListMapped = mappedAndSortedCodeLists.find(
    (codeList) => codeList.value === currentVarSelectedCodeListId,
  );
  const selectedCodeListOrUndefined = selectedCodeListMapped ?? undefined;

  const handleChangingCodeListInVariableBox = (
    selectedItem: SelectOption,
    varId: string,
    virtuosoRef: React.RefObject<VirtuosoHandle | null>,
  ) => {
    // Call the parent function to change the code list
    onChangeCodeList(selectedItem, varId);

    // Reset search state
    if (search !== '') {
      setSearch('');
    }

    // Reset the scroll show/hide state
    if (scrollingDown) {
      setScrollingDown(false);
    }

    // Reset the virtuoso list to the top/first item
    if (virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex(0);
    }
  };

  // Modify the itemRenderer to assign IDs and tabIndex
  const itemRenderer = (items: VirtualListItem[], index: number) => {
    const item = items[index];

    // There is a race condition with virtuoso where item can be undefined
    // Virtuoso will also complain if we return null or similar, so we return an empty div
    // This empty div will be removed by the Virtuoso component, and won't be rendered
    if (item === undefined) {
      return <div></div>;
    }

    // Added check for interaction type to only scroll when focused by keyboard
    const handleOnFocus = () => {
      if (!lastInteractionWasPointer.current) {
        virtuosoRef.current?.scrollToIndex({ index, align: 'center' });
      }
      lastInteractionWasPointer.current = false;
    };

    if (item.type === 'search') {
      return (
        <div
          id={`${varId}-search` + uniqueId}
          tabIndex={-1}
          className={classes['focusableItem']}
        >
          <Search
            ref={searchRef}
            value={search}
            onChange={(value: string) => {
              // Escape special characters in search value
              setSearch(value);
              // Immediate count update for live region on each keystroke
              const norm = deburr(value).toLowerCase();
              const nextCount = values.filter((v) =>
                deburr(v.label).toLowerCase().includes(norm),
              ).length;
              setSearchResultsCount(nextCount);
              if (value === '') {
                setScrollingDown(false);
              }
            }}
            aria-labelledby={
              hasCodeLists
                ? `title-${varId} ${codeListLabelId}`
                : `title-${varId}`
            }
            variant="inVariableBox"
            showLabel={false}
            searchPlaceHolder={t(
              'presentation_page.side_menu.selection.variablebox.search.placeholder',
            )}
            ariaLabelIconText={t(
              'presentation_page.side_menu.selection.variablebox.search.aria_label_icon_text',
            )}
            arialLabelClearButtonText={t(
              'presentation_page.side_menu.selection.variablebox.search.aria_label_clear_button_text',
            )}
            variableBoxTopBorderOverride={hasSelectAndSearch}
          />
        </div>
      );
    } else if (item.type === 'mixedCheckbox' && searchedValues.length > 1) {
      return (
        <>
          <div
            className={classes['spacer']}
            style={{ height: initiallyHadSevenOrMoreValues ? '4px' : '0px' }}
          ></div>
          <div
            id={varId + uniqueId}
            tabIndex={-1}
            className={cl(classes['focusableItem'], {
              [classes['mixedCheckbox']]: true,
            })}
          >
            <MixedCheckbox
              id={varId + uniqueId + 'mixedCheckbox'}
              text={
                search === ''
                  ? t(
                      'presentation_page.side_menu.selection.variablebox.content.mixed_checkbox',
                    )
                  : t(
                      'presentation_page.side_menu.selection.variablebox.content.mixed_checkbox_search',
                    )
              }
              value={allValuesSelected}
              onChange={() =>
                onChangeMixedCheckbox(varId, allValuesSelected, searchedValues)
              }
              ariaControls={valuesToRender.map(
                (value) => value.code + uniqueId,
              )}
              strong={true}
              inVariableBox={true}
            />
          </div>
        </>
      );
    } else if (
      item.type === 'value' &&
      item.value &&
      searchedValues.length > 0
    ) {
      const value = item.value;
      return (
        <>
          {searchedValues.length === 1 && search !== '' && (
            <div className={classes['spacer']}></div>
          )}
          <div
            id={value.code + uniqueId}
            tabIndex={-1}
            onPointerDown={() => {
              lastInteractionWasPointer.current = true;
            }}
            onFocus={handleOnFocus}
            className={cl(classes['focusableItem'])}
          >
            <Checkbox
              id={value.code + uniqueId + 'checkbox'}
              key={varId + value.code}
              value={
                selectedValues?.length > 0 &&
                selectedValues
                  .find((variables) => variables.id === varId)
                  ?.values.includes(value.code) === true
              }
              text={value.label}
              searchTerm={search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}
              onChange={() => onChangeCheckbox(varId, value.code)}
            />
          </div>
          {index === items.length - 1 && (
            <div className={classes['spacer']}></div>
          )}
        </>
      );
    } else if (searchedValues.length === 0 && search !== '') {
      return (
        <div
          className={cl(classes['variablebox-content-values-list-no-results'])}
          aria-live="polite"
        >
          <Heading
            size="xsmall"
            textcolor="default"
            level="4"
            align="center"
            className={cl(
              classes['variablebox-content-values-list-no-results-heading'],
            )}
          >
            {t(
              'presentation_page.side_menu.selection.variablebox.content.values_list.no_results_heading',
              { search: search },
            )}
          </Heading>
          <BodyShort size="medium" textcolor="default" align="center">
            {t(
              'presentation_page.side_menu.selection.variablebox.content.values_list.no_results_bodyshort',
            )}
          </BodyShort>
        </div>
      );
    } else {
      return null;
    }
  };

  //How many items should be sticky
  const stickyTopValueCount = hasSevenOrMoreValues
    ? 2
    : hasTwoOrMoreValues
      ? 1
      : 0;

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [scrollingDown, setScrollingDown] = useState(false);
  const [atTop, setAtTop] = useState(true);

  const handleVirtuosoScroll = () => {
    if (virtuosoRef.current) {
      virtuosoRef.current.getState((state) => {
        const scrollTop = state.scrollTop;
        const isIntentionalScrollUp = scrollTop < lastScrollPosition - 2;
        const isIntentionalScrollDown = scrollTop > lastScrollPosition + 2;

        if (isIntentionalScrollDown && !scrollingDown) {
          setScrollingDown(true);
        } else if (isIntentionalScrollUp && scrollingDown) {
          setScrollingDown(false);
        }
        setLastScrollPosition(scrollTop);
      });
    }
  };

  // To override element styling added by Virtuoso when scrolling down

  const TopItemListEmptyFragment = () => <></>;

  //Set inital height to 44
  const [calcedHeight, setCalcedHeight] = useState(44);

  const handleTotalListHeightChanged = (height: number) => {
    setCalcedHeight(height);
  };

  const handleSelectFocus = () => {
    setScrollingDown(false);
  };

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
    }
  }

  return (
    <div className={cl(classes['variablebox-content'])}>
      <div
        className={cl(classes['variablebox-content-main'])}
        style={{
          paddingTop: initiallyHadSevenOrMoreValues ? '0px' : '4px',
        }}
      >
        {hasCodeLists === true && (
          <div
            onFocus={handleSelectFocus}
            className={cl(classes['variablebox-content-select'])}
          >
            <Select
              variant="inVariableBox"
              label={t(
                'presentation_page.side_menu.selection.variablebox.content.select.label',
              )}
              languageDirection={languageDirection}
              modalHeading={label}
              modalCancelLabel={t(
                'presentation_page.side_menu.selection.variablebox.content.select.modal.cancel_button',
              )}
              modalConfirmLabel={t(
                'presentation_page.side_menu.selection.variablebox.content.select.modal.confirm_button',
              )}
              placeholder={t(
                'presentation_page.side_menu.selection.variablebox.content.select.placeholder',
              )}
              addModal={addModal}
              removeModal={removeModal}
              options={mappedAndSortedCodeLists}
              selectedOption={selectedCodeListOrUndefined}
              codeListLabelId={codeListLabelId}
              onChange={(selectedItem) =>
                selectedItem &&
                handleChangingCodeListInVariableBox(
                  selectedItem,
                  varId,
                  virtuosoRef,
                )
              }
            />
          </div>
        )}
        <div
          key={varId + '-values-list'}
          className={cl(
            classes['variablebox-content-full-values-list'],
            hasSevenOrMoreValues &&
              classes['variablebox-content-full-values-list-scroll'],
            hasCodeLists && classes['no-border-radius-top'],
          )}
          onKeyDown={handleKeyDown}
        >
          <div
            aria-label={t(
              'presentation_page.side_menu.selection.variablebox.content.values_list.aria_label',
              {
                total: totalValues,
              },
            )}
            className={cl(classes['variablebox-content-values-only-list'])}
            ref={valuesOnlyList}
          >
            {renderNumberofTablesScreenReader()}
            {items.length > 0 && (
              <Virtuoso
                computeItemKey={(key) => `item-${key}`}
                style={{
                  height: hasSevenOrMoreValues
                    ? 380
                    : Math.min(380, calcedHeight),
                  width: '100%',
                }}
                className=""
                tabIndex={-1}
                totalCount={items.length}
                itemContent={(index) => itemRenderer(items, index)}
                scrollSeekConfiguration={{
                  enter: (velocity) => Math.abs(velocity) > 1000,
                  exit: (velocity) => Math.abs(velocity) < 30,
                }}
                topItemCount={stickyTopValueCount}
                ref={virtuosoRef}
                onScroll={handleVirtuosoScroll}
                totalListHeightChanged={handleTotalListHeightChanged}
                atTopThreshold={hasSevenOrMoreValues ? 88 : 0}
                atTopStateChange={setAtTop}
                components={{
                  ScrollSeekPlaceholder,
                  TopItemList:
                    scrollingDown && search === '' && !atTop
                      ? TopItemListEmptyFragment
                      : undefined,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* TODO: Metadata Links are not implemented yet in the API. We have to wait for that to be done first. */}
    </div>
  );
}

export default VariableBoxContent;
