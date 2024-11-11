import { useEffect, useRef, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';
import { useDebounce } from '@uidotdev/usehooks';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

import classes from './VariableBoxContent.module.scss';
import { Checkbox, MixedCheckbox } from '../../Checkbox/Checkbox';
import Search from '../../Search/Search';
import { Select, SelectOption } from '../../Select/Select';
import { VariableBoxProps } from '../VariableBox';
import { SelectedVBValues } from '../VariableBox';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import { Value } from '../../../shared-types/value';
import Skeleton from '../../Skeleton/Skeleton';
import { mapCodeListsToSelectOptions } from '../../../util/util';

type VariableBoxPropsToContent = Omit<
  VariableBoxProps,
  'id' | 'mandatory' | 'tableId'
>;

/* eslint-disable-next-line */
type VariableBoxContentProps = VariableBoxPropsToContent & {
  varId: string;
  selectedValues: SelectedVBValues[];
  totalValues: number;
  totalChosenValues: number;
  onChangeCodeList: (
    selectedItem: SelectOption | undefined,
    varId: string
  ) => void;
  onChangeCheckbox: (varId: string, value: string) => void;
  onChangeMixedCheckbox: (varId: string, allValuesSelected: string, searchValues: Value[]) => void;
};

export function VariableBoxContent({
  varId,
  label,
  type,
  values,
  codeLists,
  selectedValues,
  totalValues,
  totalChosenValues,
  onChangeCodeList,
  onChangeCheckbox,
  onChangeMixedCheckbox,
}: VariableBoxContentProps) {
  const { t } = useTranslation();
  const checkboxSelectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.select_all'
  );
  const checkboxDeselectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.deselect_all'
  );

  const [mixedCheckboxText, setMixedCheckboxText] = useState<string>(
    checkboxSelectAllText
  );
  const [search, setSearch] = useState<string>('');
  const [allValuesSelected, setAllValuesSelected] = useState<
    'mixed' | 'true' | 'false'
  >('mixed');

  const debouncedSearch = useDebounce(search, 300);

  // Track the index of the currently focused item
  const [currentFocusedItemIndex, setCurrentFocusedItemIndex] = useState<
    number | null
  >(null);

  const [items, setItems] = useState<{ type: string; value?: Value }[]>([]);

  const valuesOnlyList = useRef<HTMLDivElement>(null);
  const hasCodeLists = codeLists && codeLists.length > 0;
  const hasSevenOrMoreValues = values && values.length > 6;
  const hasTwoOrMoreValues = values && values.length > 1;
  const hasSelectAndSearch = hasCodeLists && hasSevenOrMoreValues;
  const valuesToRender = structuredClone(values);

  // The API always returns the oldest values first,
  // so we can just reverse the values array when the type is TIME_VARIABLE
  if (type === VartypeEnum.TIME_VARIABLE) {
    valuesToRender.reverse();
  }

  useEffect(() => {
    const newItems: { type: string; value?: Value }[] = [];

    if (hasSevenOrMoreValues) {
      newItems.push({ type: 'search' });
    }

    if (hasTwoOrMoreValues) {
      newItems.push({ type: 'mixedCheckbox' });
    }

    valuesToRender
      .filter(
        (value) =>
          value.label.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1
      )
      .forEach((value) => {
        newItems.push({ type: 'value', value });
      });

    setItems(newItems);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasSevenOrMoreValues, hasTwoOrMoreValues, debouncedSearch, values]);

  useEffect(() => {
    if (totalChosenValues === 0) {
      setMixedCheckboxText(checkboxSelectAllText);
      setAllValuesSelected('false');
    }
    if (totalChosenValues > 0 && totalChosenValues < totalValues) {
      setMixedCheckboxText(checkboxSelectAllText);
      setAllValuesSelected('mixed');
    }
    if (totalChosenValues === totalValues) {
      setMixedCheckboxText(checkboxDeselectAllText);
      setAllValuesSelected('true');
    }
  }, [
    totalChosenValues,
    totalValues,
    checkboxSelectAllText,
    checkboxDeselectAllText,
  ]);

  let mappedCodeLists: SelectOption[] = [];

  if (hasCodeLists === true) {
    mappedCodeLists = mapCodeListsToSelectOptions(codeLists);
  }

  // needs the selected, mapped code list for the current variable
  const currentVarSelectedCodeListId = selectedValues.find(
    (variable) => variable.id === varId
  )?.selectedCodeList;
  const selectedCodeListMapped = mappedCodeLists.find(
    (codeList) => codeList.value === currentVarSelectedCodeListId
  );
  const selectedCodeListOrUndefined = selectedCodeListMapped ?? undefined;

  const handleValueListKeyboardNavigation = (
    event: React.KeyboardEvent<HTMLDivElement>
  ) => {
    const { key } = event;

    if (key !== 'ArrowDown' && key !== 'ArrowUp') {
      return;
    }
    event.preventDefault();
    let newIndex = currentFocusedItemIndex;

    if (key === 'ArrowDown') {
      if (
        currentFocusedItemIndex === null ||
        currentFocusedItemIndex < items.length - 1
      ) {
        newIndex = (currentFocusedItemIndex ?? -1) + 1;
      }
    } else if (key === 'ArrowUp') {
      if (currentFocusedItemIndex !== null && currentFocusedItemIndex > 0) {
        newIndex = currentFocusedItemIndex - 1;
      }
    }

    if (newIndex !== null && newIndex !== currentFocusedItemIndex) {
      setCurrentFocusedItemIndex(newIndex);

      // Focus the new item
      const item = items[newIndex];
      let elementId: string | null = null;

      if (item.type === 'value' && item.value) {
        elementId = item.value.code;
      } else if (item.type === 'search') {
        elementId = `${varId}-search`;
      } else if (item.type === 'mixedCheckbox') {
        elementId = varId;
      }

      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.focus();
        }
      }
    }
  };

  const searchedValues : Value[] = values.filter((value) => value.label.toLowerCase().indexOf(debouncedSearch.toLowerCase()) > -1);

  // Modify the itemRenderer to assign IDs and tabIndex
  const itemRenderer = (items: any, index: number) => {
    const item = items[index];

    if (item.type === 'search') {
      return (
        <div
          id={`${varId}-search`}
          tabIndex={-1}
          className={classes['focusableItem']}
        >
          <Search
            onChange={(value: string) => {
              setSearch(value);
              if(value === '') {
                setScrollingDown(false);
              }
            }}
            variant="inVariableBox"
            showLabel={false}
            searchPlaceHolder={t(
              'presentation_page.sidemenu.selection.variablebox.search.placeholder'
            )}
            ariaLabelIconText={t(
              'presentation_page.sidemenu.selection.variablebox.search.arialabelicontext'
            )}
            arialLabelClearButtonText={t(
              'presentation_page.sidemenu.selection.variablebox.search.ariallabelclearbuttontext'
            )}
            variableBoxTopBorderOverride={hasSelectAndSearch}
          />
        </div>
      );
    } else if (item.type === 'mixedCheckbox') {
      return (
        <div id={varId} tabIndex={-1} className={classes['focusableItem']}>
          <MixedCheckbox
            id={varId}
            text={mixedCheckboxText}
            value={allValuesSelected}
            onChange={() => onChangeMixedCheckbox(varId, allValuesSelected, searchedValues)}
            ariaControls={valuesToRender.map((value) => value.code)}
            strong={true}
            inVariableBox={true}
          />
        </div>
      );
    } else if (item.type === 'value' && item.value) {
      const value = item.value;
      return (
        <div id={value.code} tabIndex={-1} className={classes['focusableItem']}>
          <Checkbox
            id={value.code}
            key={varId + value.code}
            tabIndex={-1}
            value={
              selectedValues?.length > 0 &&
              selectedValues
                .find((variables) => variables.id === varId)
                ?.values.includes(value.code) === true
            }
            text={value.label.charAt(0).toUpperCase() + value.label.slice(1)}
            searchTerm={search}
            onChange={() => onChangeCheckbox(varId, value.code)}
          />
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
  /* eslint-disable-next-line */
  const TopItemListEmptyFragment = () => <></>;

  return (
    <div className={cl(classes['variablebox-content'])}>
      <div className={cl(classes['variablebox-content-main'])}>
        {hasCodeLists === true && (
          <div className={cl(classes['variablebox-content-select'])}>
            <Select
              variant="inVariableBox"
              label={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.label'
              )}
              modalHeading={label}
              modalCancelLabel={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.modal.cancel_button'
              )}
              modalConfirmLabel={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.modal.confirm_button'
              )}
              placeholder={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.placeholder'
              )}
              options={mappedCodeLists}
              selectedOption={selectedCodeListOrUndefined}
              onChange={(selectedItem) => onChangeCodeList(selectedItem, varId)}
            />
          </div>
        )}
        <div
          key={varId + '-values-list'}
          className={cl(
            classes['variablebox-content-full-values-list'],
            hasSevenOrMoreValues &&
              classes['variablebox-content-full-values-list-scroll']
          )}
        >
          <div
            aria-label={t(
              'presentation_page.sidemenu.selection.variablebox.content.values_list.aria_label',
              {
                total: totalValues,
              }
            )}
            aria-description={t(
              'presentation_page.sidemenu.selection.variablebox.content.values_list.aria_description',
              {
                total: totalValues,
              }
            )} // Coming in WAI-ARIA 1.3
            className={cl(classes['variablebox-content-values-only-list'])}
            tabIndex={0}
            ref={valuesOnlyList}
            onKeyDown={handleValueListKeyboardNavigation}
          >
            {' '}
            {items.length > 0 && (
              <Virtuoso
                computeItemKey={(key) => `item-${key}`}
                style={{ height: '380px', maxHeight: '380px', width: '100%' }}
                className=""
                totalCount={items.length}
                itemContent={(index) => itemRenderer(items, index)}
                scrollSeekConfiguration={{
                  enter: (velocity) => Math.abs(velocity) > 1000,
                  exit: (velocity) => Math.abs(velocity) < 30,
                }}
                topItemCount={stickyTopValueCount}
                ref={virtuosoRef}
                onScroll={handleVirtuosoScroll}
                components={{
                  ScrollSeekPlaceholder: ({ height }) => (
                    <Skeleton
                      aria-label="placeholder"
                      height={'25px'}
                      width={50 + Math.ceil(Math.random() * 15) + '%'}
                    />
                  ),
                  TopItemList: (scrollingDown && search === '')
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
