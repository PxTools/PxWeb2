import { useEffect, useRef, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxContent.module.scss';
import { Checkbox, MixedCheckbox } from '../../Checkbox/Checkbox';
import Search from '../../Search/Search';
import { Select, SelectOption } from '../../Select/Select';
import { Value } from '../../../shared-types/value';
import { VariableBoxProps } from '../VariableBox';

import { SelectedVBValues } from '../VariableBox';

type MappedCodeList = {
  value: string;
  label: string;
};
type VariableBoxPropsToContent = Omit<VariableBoxProps, 'id' | 'mandatory'>;

// TODO: should selectedValues and setSelectedValues be string[] or Value['code'][]?
/* eslint-disable-next-line */
type VariableBoxContentProps = VariableBoxPropsToContent & {
  varId: string;
  selectedValues: SelectedVBValues[];
  setSelectedValues: (values: SelectedVBValues[]) => void;
  totalValues: number;
  totalChosenValues: number;
  onChangeCodeList: (selectedItem: SelectOption | undefined) => void;
};

export function VariableBoxContent({
  varId,
  label,
  values,
  codeLists,
  selectedValues,
  setSelectedValues,
  totalValues,
  totalChosenValues,
  onChangeCodeList,
}: VariableBoxContentProps) {
  const { t } = useTranslation();
  const checkboxSelectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.select_all'
  );
  const checkboxDeselectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.deselect_all'
  );

  // TODO: Do we need 3 states for animating the scrolling? Can we simplify this? Maybe use useReducer instead?
  const [scrolling, setScrolling] = useState<'atTop' | 'up' | 'down'>('atTop');
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [mixedCheckboxText, setMixedCheckboxText] = useState<string>(
    checkboxSelectAllText
  );
  const [allValuesSelected, setAllValuesSelected] = useState<
    'mixed' | 'true' | 'false'
  >('mixed');

  const scrollRef = useRef<HTMLDivElement>(null);
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

  const handleMixedCheckboxChange = () => {
    const prevSelectedValues = structuredClone(selectedValues);

    function deselectAllValuesOfVariable(
      selectedValuesArr: SelectedVBValues[]
    ): SelectedVBValues[] {
      const newValues: SelectedVBValues[] = selectedValuesArr
        .map((variable) => {
          if (variable.id === varId) {
            if (variable.selectedCodeList !== undefined) {
              return {
                id: varId,
                selectedCodeList: variable.selectedCodeList,
                values: [],
              };
            }
            if (variable.selectedCodeList === undefined) {
              return null;
            }
          }

          return variable;
        })
        .filter((value) => value !== null) as SelectedVBValues[];

      return newValues;
    }

    if (allValuesSelected === 'true') {
      const newSelectedValues = deselectAllValuesOfVariable(prevSelectedValues);

      setSelectedValues(newSelectedValues);
    }
    if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
      const variable = prevSelectedValues.find(
        (variable) => variable.id === varId
      );

      if (variable) {
        const newSelectedValues = prevSelectedValues.map((variable) => {
          if (variable.id === varId) {
            variable.values = values.map((value) => value.code);
          }

          return variable;
        });

        setSelectedValues(newSelectedValues);
      }
      if (!variable) {
        const newSelectedValues = [
          ...prevSelectedValues,
          {
            id: varId,
            selectedCodeList: undefined,
            values: values.map((value) => value.code),
          },
        ];

        setSelectedValues(newSelectedValues);
      }
    }
  };

  const handleCheckboxChange = (value: Value['code']) => {
    const hasVariable =
      selectedValues.findIndex((variables) => variables.id === varId) !== -1;
    const hasValue = selectedValues
      .find((variables) => variables.id === varId)
      ?.values.includes(value);
    const prevSelectedValues = structuredClone(selectedValues);

    if (hasVariable) {
      // doesn't have value, add it
      if (!hasValue) {
        setSelectedValues(
          prevSelectedValues.map((variable) => {
            if (variable.id === varId) {
              variable.values = [...variable.values, value];
            }

            return variable;
          })
        );
      }

      // has value, remove it
      if (hasValue) {
        let hasMultipleValues = false;

        setSelectedValues(
          prevSelectedValues.map((variable) => {
            if (variable.id === varId) {
              hasMultipleValues = variable.values.length > 1;

              variable.values = variable.values.filter((val) => val !== value);
            }

            return variable;
          })
        );

        // remove the variable if it now has no values
        if (!hasMultipleValues) {
          setSelectedValues(
            prevSelectedValues.filter((variables) => variables.id !== varId) // TODO: This wont work as intended. We need to check if the codeList is selected or not also
          );
        }
      }
    }
    if (!hasVariable) {
      setSelectedValues([
        ...selectedValues,
        { id: varId, selectedCodeList: undefined, values: [value] },
      ]);
    }
  };

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

  console.log('selectedValues', selectedValues);

  const currentVarSelectedCodeList = selectedValues.find(
    (variable) => variable.id === varId
  )?.selectedCodeList;

  return (
    <div className={cl(classes['variablebox-content'])}>
      {/* Add the Alert here, see note in figma about it. Need more functionality atm i think */}

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
              } // TODO: Finish the logic for this. This is the selected option, like "region" or "age". Needs modal with radio logic inside.
              onChange={onChangeCodeList}
            />
          </div>
        )}

        <div
          key={varId + '-values-list'}
          className={cl(
            classes['variablebox-content-values-list'],
            hasSevenOrMoreValues &&
              classes['variablebox-content-values-list-scroll']
          )}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          <div
            className={cl(
              hasSevenOrMoreValues &&
                scrolling === 'up' &&
                classes['variablebox-content-values-list-scroll-up'],
              hasSevenOrMoreValues &&
                scrolling === 'down' &&
                hasScrolledUp === true &&
                classes['variablebox-content-values-list-scroll-down']
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
                onChange={handleMixedCheckboxChange}
                ariaControls={values.map((value) => value.code)}
                strong={true}
                inVariableBox={true}
              />
            )}
          </div>

          {hasValues &&
            values.map((value) => (
              <Checkbox
                id={value.code}
                value={
                  selectedValues?.length > 0 &&
                  selectedValues
                    .find((variables) => variables.id === varId)
                    ?.values.includes(value.code) === true
                }
                text={value.label}
                onChange={() => handleCheckboxChange(value.code)}
              />
            ))}
        </div>
      </div>

      {/* TODO: Metadata Links are not implemented yet in the API. We have to wait for that to be done first. */}
    </div>
  );
}

export default VariableBoxContent;
