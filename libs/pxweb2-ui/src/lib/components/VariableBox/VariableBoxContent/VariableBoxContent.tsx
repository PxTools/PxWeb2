import { useEffect, useRef, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxContent.module.scss';
import { Checkbox, MixedCheckbox } from '../../Checkbox/Checkbox';
import Search from '../../Search/Search';
import { Select, SelectOption } from '../../Select/Select';
import { VariableBoxProps } from '../VariableBox';
import { SelectedVBValues } from '../VariableBox';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Value } from '../../../shared-types/value';

type MappedCodeList = {
  value: string;
  label: string;
};
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
  onChangeMixedCheckbox: (varId: string, allValuesSelected: string) => void;
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

  const [scrolling, setScrolling] = useState<'atTop' | 'up' | 'down'>('atTop');
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [mixedCheckboxText, setMixedCheckboxText] = useState<string>(
    checkboxSelectAllText
  );
  const [search, setSearch] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<
    { type: string; value?: Value }[]
  >([]);
  const [allValuesSelected, setAllValuesSelected] = useState<
    'mixed' | 'true' | 'false'
  >('mixed');

  // Track the index of the currently focused item
  const [currentFocusedItemIndex, setCurrentFocusedItemIndex] = useState<
    number | null
  >(null);

  const [items, setItems] = useState<{ type: string; value?: Value }[]>([]);

  const valuesOnlyList = useRef<HTMLDivElement>(null);
  const hasCodeLists = codeLists && codeLists.length > 0;
  const hasSevenOrMoreValues = values && values.length > 6;
  const hasTwoOrMoreValues = values && values.length > 1;
  const hasValues = values && values.length > 0;
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

    values
      .filter((value) => value.label.indexOf(search) > -1)
      .forEach((value) => {
        newItems.push({ type: 'value', value });
      });

    setItems(newItems);
  }, [hasSevenOrMoreValues, hasTwoOrMoreValues, search, values]);

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

  const handleScroll = (scrollTop: number) => {
    const isScrolling = scrollTop > 0;
    const isIntentionalScrollUp = scrollTop < lastScrollPosition - 5;
    const isIntentionalScrollDown = scrollTop > lastScrollPosition + 5;

    // Reset scrolling state when at the top of the list
    if (scrollTop === 0 && scrolling !== 'atTop') {
      setScrolling('atTop');
      setHasScrolledUp(false);
    }

    if (isScrolling && isIntentionalScrollUp) {
      setLastScrollPosition(scrollTop);

      if (scrolling !== 'up') {
        setScrolling('up');
        setHasScrolledUp(true);
      }
    }

    if (isScrolling && isIntentionalScrollDown) {
      setLastScrollPosition(scrollTop);

      if (scrolling !== 'down') {
        setScrolling('down');
      }
    }
  };

  let mappedCodeList: MappedCodeList[] = [];

  if (hasCodeLists === true) {
    mappedCodeList = codeLists?.map((codeList) => {
      return {
        value: codeList.id,
        label: codeList.label,
      };
    });
  }

  // Reference to the Virtuoso list
  const listRef = useRef<VirtuosoHandle | null>(null);

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
          console.log('focused on this', element);
          element.focus();
        }
      }

      // Scroll the list to the index
      if (listRef.current) {
        listRef.current.scrollToIndex({
          index: newIndex,
          align: 'center',
        });
      }
    }
  };

  const currentVarSelectedCodeList = selectedValues.find(
    (variable) => variable.id === varId
  )?.selectedCodeList;

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
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              console.log('setSearch!', event.currentTarget.value);
              setSearch(event.currentTarget.value);
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
            onChange={() => onChangeMixedCheckbox(varId, allValuesSelected)}
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
            onChange={() => onChangeCheckbox(varId, value.code)}
          />
        </div>
      );
    } else {
      return null;
    }
  };

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
              placeholder={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.placeholder'
              )}
              options={mappedCodeList}
              selectedOption={
                currentVarSelectedCodeList
                  ? currentVarSelectedCodeList
                  : undefined
              }
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
                ref={listRef}
                style={{ height: '380px', maxHeight: '380px', width: '100%' }}
                className=""
                totalCount={items.length}
                itemContent={(index) => itemRenderer(items, index)}
                onScroll={(event) => {
                  const target = event.target as HTMLDivElement;
                  handleScroll(target.scrollTop);
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
