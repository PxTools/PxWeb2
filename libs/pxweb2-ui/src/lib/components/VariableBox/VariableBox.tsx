import { useEffect, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBox.module.scss';
import { Checkbox, MixedCheckbox } from '../Checkbox/Checkbox';
import { Icon } from '../Icon/Icon';
import Search from '../Search/Search';
import { Select, SelectOption } from '../Select/Select';
import Tag from '../Tag/Tag';
import Heading from '../Typography/Heading/Heading';
import { Variable } from '../../shared-types/variable';
import { Value } from '../../shared-types/value';

/* eslint-disable-next-line */
export type VariableBoxProps = Omit<Variable, 'type' | 'notes'>;

export function VariableBox({
  id,
  label,
  mandatory = false,
  values,
  codeLists,
}: VariableBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<Value['code'][]>([]);

  /** Maybe improve names? */
  const totalValues = values?.length;
  const totalChosenValues = selectedValues.length;

  /*
   * How do we handle the state of chosen options/values?
   * - should the state be handled here or in the parent component and passed down through props?
   *
   * isOpen is handled here, but should selectedValues be handled here as well?
   * - No, it should be in parent component?
   *
   * How should we structure the HTML in terms of sections, divs, etc?
   */

  return (
    <div className={cl(classes.variablebox)} key={id}>
      <VariableBoxHeader
        label={label}
        mandatory={mandatory}
        totalValues={totalValues}
        totalChosenValues={totalChosenValues}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {isOpen && (
        <VariableBoxContent
          id={id}
          label={label}
          values={values}
          codeLists={codeLists}
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
          totalValues={totalValues}
          totalChosenValues={totalChosenValues}
          isOpen={isOpen}
        />
      )}
    </div>
  );
}

type VariableBoxPropsToHeader = Pick<VariableBoxProps, 'label' | 'mandatory'>;

type VariableBoxHeaderProps = VariableBoxPropsToHeader & {
  totalValues: number;
  totalChosenValues: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tabIndex?: number;
};

function VariableBoxHeader({
  label,
  mandatory,
  totalValues,
  totalChosenValues,
  isOpen,
  setIsOpen,
  tabIndex = 0,
}: VariableBoxHeaderProps) {
  const { t } = useTranslation();
  const capitalizedTitle = label.charAt(0).toUpperCase() + label.slice(1);

  function handleHeaderClick() {
    setIsOpen(!isOpen);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      setIsOpen(!isOpen);
    }
  }

  return (
    <div
      className={cl(
        classes['variablebox-header'],
        isOpen && classes['variablebox-header-isopen']
      )}
      onClick={handleHeaderClick}
      onKeyDown={(e) => handleKeyDown(e)}
      tabIndex={tabIndex}
    >
      <div className={cl(classes['header-title-and-tag'])}>
        {/* TODO: Is this the right level for Heading here?*/}
        <Heading level="3" className={cl(classes['header-title'])} size="small">
          {capitalizedTitle}
        </Heading>
        <div className={cl(classes['header-tags'])}>
          <Tag variant="success">
            {t(
              'presentation_page.sidemenu.selection.variablebox.header.tag_selected',
              {
                selected: t('number.simple_number_with_zero_decimal', {
                  value: totalChosenValues,
                }),
                total: t('number.simple_number_with_zero_decimal', {
                  value: totalValues,
                }),
              }
            )}
          </Tag>
          {mandatory && (
            <Tag variant="info">
              {t(
                'presentation_page.sidemenu.selection.variablebox.header.tag_mandatory'
              )}
            </Tag>
          )}
        </div>
      </div>

      <div className={cl(classes['header-icon'])}>
        {isOpen ? (
          <Icon iconName="ChevronUp"></Icon>
        ) : (
          <Icon iconName="ChevronDown"></Icon>
        )}
      </div>
    </div>
  );
}

type MappedCodeList = {
  value: string;
  label: string;
};

type VariableBoxPropsToContent = Omit<VariableBoxProps, 'mandatory'>;

// TODO: should selectedValues and setSelectedValues be string[] or Value['code'][]?
type VariableBoxContentProps = VariableBoxPropsToContent & {
  selectedValues: Value['code'][];
  setSelectedValues: (values: Value['code'][]) => void;
  totalValues: number;
  totalChosenValues: number;
  isOpen: boolean;
};

function VariableBoxContent({
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

  const [allValuesSelected, setAllValuesSelected] = useState<
    'mixed' | 'true' | 'false'
  >('mixed');
  const [mixedCheckboxText, setMixedCheckboxText] = useState(
    checkboxSelectAllText
  );

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
          <div className={classes['variablebox-content-select']}>
            <Select
              variant="inVariableBox"
              label={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.label'
              )}
              placeholder={t(
                'presentation_page.sidemenu.selection.variablebox.content.select.placeholder'
              )}
              options={mappedCodeList}
              selectedOption={ undefined } // TODO: Finish the logic for this. This is the selected option, like "region" or "age". Needs modal with radio logic inside.
              onChange={handleSelectOnChange}
            />
          </div>
        )}

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

        <div className={cl(classes['variablebox-content-values-list'])}>
          {hasTwoOrMoreValues && (
            <MixedCheckbox
              id={id}
              text={mixedCheckboxText}
              value={allValuesSelected}
              onChange={handleMixedCheckboxChange}
              ariaControls={values.map((value) => value.code)}
              strong={true}
            />
          )}

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

export default VariableBox;
