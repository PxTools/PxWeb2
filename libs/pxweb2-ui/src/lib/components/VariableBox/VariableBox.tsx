import { useState } from 'react';
import cl from 'clsx';
import { useTranslation } from 'react-i18next';

import classes from './VariableBox.module.scss';
import Button from '../Button/Button';
import Tag from '../Tag/Tag';
import Heading from '../Typography/Heading/Heading';
import { Variable } from '../../shared-types/variable';

/* eslint-disable-next-line */
export interface VariableBoxProps extends Variable {
  metadataLink?: string;
}

interface VariableBoxHeaderProps {
  label: string;
  mandatory: boolean;
  totalValues: number;
  totalChosenValues: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  metadataLink?: string;
}

interface VariableBoxContentProps {
  values: Variable['values'];
  codeLists: Variable['codeLists'];
  notes: Variable['notes'];
}

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
      className={cl(classes['variablebox-header'])}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className={cl(classes['header-title-and-tag'])}>
        {/* TODO: Is this the right level for Heading here?
        * WARNING: THIS ONE ADDS MARGIN TOP AND BOTTOM 18px ATM -> USER AGENT STYLESHEET
        */}
        <Heading level="3" className={cl(classes['header-title'])} size="small">
          {capitalizedTitle}
        </Heading>
        <div className={cl(classes['header-tags'])}>
          <Tag variant="success">
            {totalChosenValues} av {totalValues} valgt
          </Tag>
          {/* TODO: Add translation */}
          {mandatory && (
            <Tag variant="info">{t('common.generic_tags.mandatory')}</Tag> 
            /*
              TODO: Is this the correct place for this translation?
              Could other places want something else for "Mandatory" than "Må velges"?
            */
          )}
          {/* TODO: Add translation */}
        </div>
      </div>

      <div className={cl(classes['header-btn'])}>
        <Button variant="tertiary" size='medium' icon={isOpen ? 'ChevronUp' : 'ChevronDown'} />
      </div>
    </section>
  );
}

function VariableBoxContent({
  values,
  codeLists,
  notes,
}: VariableBoxContentProps) {
  return (
    <section className={cl(classes['variablebox-content'])}>
      {/* TODO: Add check for codelists here. Insert select if it has them? */}

      {/* TODO: Add checkboxes here */}

      {/* TODO: Add notes? */}

      {/* TODO: Add metadata links */}
    </section>
  );
}

export function VariableBox({
  label,
  type /* TODO: Is this needed? */,
  mandatory = false,
  values,
  codeLists,
  notes,
  metadataLink = '',
}: VariableBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const totalValues = values?.length;
  const totalChosenValues = selectedValues.length;

  /*
   * How do we handle the state of chosen options/values?
   * - should the state be handled here or in the parent component?
   * isOpen is handled here, but should selectedValues be handled here as well?
   * - No, it should be in parent component?
   *
   * Should we have separate components for the header and the content?
   * How should we structure the HTML in terms of sections, divs, etc?
   */

  return (
    <div className={cl(classes.variablebox)}>
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
          values={values}
          codeLists={codeLists}
          notes={notes}
        />
      )}
    </div>
  );
}

export default VariableBox;
