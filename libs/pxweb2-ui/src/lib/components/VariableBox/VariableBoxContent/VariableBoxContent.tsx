import { useEffect, useRef, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxContent.module.scss';
import { Checkbox, MixedCheckbox } from '../../Checkbox/Checkbox';
import Search from '../../Search/Search';
import { Select, SelectOption } from '../../Select/Select';
import { VariableBoxProps } from '../VariableBox';

import { SelectedVBValues } from '../VariableBox';

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
  const [allValuesSelected, setAllValuesSelected] = useState<
    'mixed' | 'true' | 'false'
  >('mixed');
  const [valuesTabIndex, setValuesTabIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const valuesOnlyList = useRef<HTMLDivElement>(null);
  const hasCodeLists = codeLists && codeLists.length > 0;
  const hasSevenOrMoreValues = values && values.length > 6;
  const hasTwoOrMoreValues = values && values.length > 1;
  const hasValues = values && values.length > 0;
  const hasSelectAndSearch = hasCodeLists && hasSevenOrMoreValues;

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

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop } = scrollRef.current;
      const isScrolling = scrollTop > 0;
      const isIntentionalScrollUp = scrollTop < lastScrollPosition - 5;
      const isIntentionalScrollDown = scrollTop > lastScrollPosition + 5;
      const isBelowFirstTwoElements =
        scrollTop > scrollRef.current.children[0].clientHeight;

      //  Reset scrolling state when at the top of the list
      if (scrollTop === 0 && scrolling !== 'atTop') {
        setScrolling('atTop');
        setHasScrolledUp(false);
      }

      if (isScrolling) {
        if (isIntentionalScrollUp && isBelowFirstTwoElements) {
          setLastScrollPosition(scrollTop);

          if (scrolling !== 'up') {
            setScrolling('up');
            setHasScrolledUp(true);
          }
        }

        if (isIntentionalScrollDown && isBelowFirstTwoElements) {
          setLastScrollPosition(scrollTop);

          if (scrolling !== 'down') {
            setScrolling('down');
          }
        }
      }
    }
  };

  const handleSearch = () => {
    //  TODO: Implement search functionality
    console.log('Search');
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

  const currentVarSelectedCodeList = selectedValues.find(
    (variable) => variable.id === varId
  )?.selectedCodeList;

  return (
    <div className={cl(classes['variablebox-content'])}>
      {/* TODO: Add the Alert here, see note in figma about it. Need more functionality atm i think */}

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
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div
            className={cl(
              hasSevenOrMoreValues &&
                scrolling === 'up' &&
                classes['variablebox-content-full-values-list-scroll-up'],
              hasSevenOrMoreValues &&
                scrolling === 'down' &&
                hasScrolledUp === true &&
                classes['variablebox-content-full-values-list-scroll-down']
            )}
          >
            {hasSevenOrMoreValues && (
              <Search
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
            )}

            {hasTwoOrMoreValues && (
              <MixedCheckbox
                id={varId}
                text={mixedCheckboxText}
                value={allValuesSelected}
                onChange={() => onChangeMixedCheckbox(varId, allValuesSelected)}
                ariaControls={values.map((value) => value.code)}
                strong={true}
                inVariableBox={true}
              />
            )}
          </div>

          {hasValues && (
            <div
              className={cl(classes['variablebox-content-values-only-list'])}
              tabIndex={0}
              ref={valuesOnlyList}
              onKeyUp={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();

                  const prevTabIndex = valuesTabIndex;

                  setValuesTabIndex(0);

                  if (prevTabIndex === -1) {
                    const firstCheckbox = document.getElementById(
                      values[0].code
                    );

                    firstCheckbox?.focus();
                  }
                }

                if (event.key === 'ArrowUp') {
                  event.preventDefault();

                  setValuesTabIndex(-1);

                  // Change focus to parent values list
                  valuesOnlyList.current?.focus();
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                  event.preventDefault();
                }
              }}
            >
              {values.map((value) => (
                <Checkbox
                  id={value.code}
                  tabIndex={valuesTabIndex}
                  value={
                    selectedValues?.length > 0 &&
                    selectedValues
                      .find((variables) => variables.id === varId)
                      ?.values.includes(value.code) === true
                  }
                  text={
                    value.label.charAt(0).toUpperCase() + value.label.slice(1)
                  }
                  onChange={() => onChangeCheckbox(varId, value.code)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TODO: Metadata Links are not implemented yet in the API. We have to wait for that to be done first. */}
    </div>
  );
}

export default VariableBoxContent;
