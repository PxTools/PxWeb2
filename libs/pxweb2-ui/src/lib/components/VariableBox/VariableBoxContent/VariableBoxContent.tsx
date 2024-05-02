import { useEffect, useRef, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBoxContent.module.scss';
import { Checkbox, MixedCheckbox } from '../../Checkbox/Checkbox';
import Search from '../../Search/Search';
import { Select, SelectOption } from '../../Select/Select';
import { Value } from '../../../shared-types/value';
import { VariableBoxProps } from '../VariableBox';

type MappedCodeList = {
  value: string;
  label: string;
};
type VariableBoxPropsToContent = Omit<VariableBoxProps, 'mandatory'>;

// TODO: should selectedValues and setSelectedValues be string[] or Value['code'][]?
/* eslint-disable-next-line */
type VariableBoxContentProps = VariableBoxPropsToContent & {
  selectedValues: Value['code'][];
  setSelectedValues: (values: Value['code'][]) => void;
  totalValues: number;
  totalChosenValues: number;
};

export function VariableBoxContent({
  id,
  label,
  values,
  codeLists,
  selectedValues,
  setSelectedValues,
  totalValues,
  totalChosenValues,
}: VariableBoxContentProps) {
  const { t } = useTranslation();
  const checkboxSelectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.select_all'
  );
  const checkboxDeselectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.deselect_all'
  );

  // TODO: Do we need 3 states for animating the scrolling? Can we simplify this?
  const [scrolling, setScrolling] = useState<'atTop' | 'up' | 'down'>('atTop');
  const [hasScrolledUp, setHasScrolledUp] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [mixedCheckboxText, setMixedCheckboxText] = useState(
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
    if (allValuesSelected === 'true') {
      setSelectedValues([]);
    }
    if (allValuesSelected === 'false' || allValuesSelected === 'mixed') {
      setSelectedValues(values.map((value) => value.code));
    }
  };

  const handleCheckboxChange = (value: Value['code']) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(selectedValues.filter((val) => val !== value));
    }
    if (!selectedValues.includes(value)) {
      setSelectedValues([...selectedValues, value]);
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

  const handleSelectOnChange = (selectedItem: SelectOption | undefined) => {
    selectedItem
      ? console.log('Selected option: ' + selectedItem.label)
      : console.log('No option selected');
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
              placeholder={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.placeholder'
              )}
              options={mappedCodeList}
              selectedOption={undefined} // TODO: Finish the logic for this. This is the selected option, like "region" or "age". Needs modal with radio logic inside.
              onChange={handleSelectOnChange}
            />
          </div>
        )}

        <div
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
                id={id}
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
                value={selectedValues.includes(value.code)}
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
