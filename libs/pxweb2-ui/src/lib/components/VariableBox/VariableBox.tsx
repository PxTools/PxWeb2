import { useEffect, useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBox.module.scss';
import Button from '../Button/Button';
import { Checkbox, MixedCheckbox } from '../Checkbox/Checkbox';
import Tag from '../Tag/Tag';
import Heading from '../Typography/Heading/Heading';
import { Variable } from '../../shared-types/variable';
import { Value } from '../../shared-types/value';

/* eslint-disable-next-line */
export type VariableBoxProps = Omit<Variable, 'type'>;

export function VariableBox({
  id,
  label,
  mandatory = false,
  values,
  codeLists,
  notes,
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
          values={values}
          codeLists={codeLists}
          notes={notes}
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
};

function VariableBoxHeader({
  label,
  mandatory,
  totalValues,
  totalChosenValues,
  isOpen,
  setIsOpen,
}: VariableBoxHeaderProps) {
  const { t } = useTranslation();
  const capitalizedTitle = label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <section
      className={cl(
        classes['variablebox-header'],
        isOpen && classes['variablebox-header-isopen']
      )}
      onClick={() => setIsOpen(!isOpen)}
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

      <div className={cl(classes['header-btn'])}>
        <Button
          variant="tertiary"
          size="medium"
          icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
        />
      </div>
    </section>
  );
}

type VariableBoxPropsToContent = Omit<VariableBoxProps, 'label' | 'mandatory'>;

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
  values,
  codeLists,
  notes,
  selectedValues,
  setSelectedValues,
  totalValues,
  totalChosenValues,
  isOpen,
}: VariableBoxContentProps) {
  const { t } = useTranslation();
  const checkboxSelectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.select_all'
  );
  const checkboxDeselectAllText = t(
    'presentation_page.sidemenu.selection.variablebox.content.mixed_checkbox.deselect_all'
  );

  const [allSelected, setAllSelected] = useState<'mixed' | 'true' | 'false'>(
    'mixed'
  );
  const [mixedCheckboxText, setMixedCheckboxText] = useState(
    checkboxSelectAllText
  );

  useEffect(() => {
    if (totalChosenValues === 0) {
      setMixedCheckboxText(checkboxSelectAllText);
      setAllSelected('false');
    }
    if (totalChosenValues > 0 && totalChosenValues < totalValues) {
      setMixedCheckboxText(checkboxSelectAllText);
      setAllSelected('mixed');
    }
    if (totalChosenValues === totalValues) {
      setMixedCheckboxText(checkboxDeselectAllText);
      setAllSelected('true');
    }
  }, [
    totalChosenValues,
    totalValues,
    checkboxSelectAllText,
    checkboxDeselectAllText,
  ]);

  const handleMixedCheckboxChange = () => {
    if (allSelected === 'true') {
      setSelectedValues([]);
    }
    if (allSelected === 'false' || allSelected === 'mixed') {
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

  return (
    <section className={cl(classes['variablebox-content'])}>
      <div className={cl(classes['variablebox-content-values-list'])}>
        {/* Add the Alert here, see note in figma about it. Need more functionality atm i think */}

        {/* TODO: Add check for codelists here. Insert select if it has them? */}
        {codeLists && <p>Has a codelist. Add the Select component</p>}

        {values && values.length > 6 && (
          <p>Has more than 6 values. Add the Search component.</p>
        )}

        {values && values.length > 1 && (
          <MixedCheckbox
            id={id}
            text={mixedCheckboxText}
            value={allSelected}
            onChange={handleMixedCheckboxChange}
            ariaControls={values.map((value) => value.code)}
            strong={true}
          />
        )}

        {values.length > 0 &&
          values.map((value) => (
            <Checkbox
              id={value.code}
              value={selectedValues.includes(value.code)}
              text={value.label}
              onChange={() => handleCheckboxChange(value.code)}
            />
          ))}

        {/* TODO: Add notes? Or is this shown somewhere else? */}
        {notes && <p>Has notes</p>}
      </div>

      {/* TODO: Metadata Links are not implemented yet in the API. We have to wait for that to be done first. */}
    </section>
  );
}

export default VariableBox;
