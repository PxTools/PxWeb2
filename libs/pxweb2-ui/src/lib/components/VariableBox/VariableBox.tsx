import { useState } from 'react';
import cl from 'clsx';

import classes from './VariableBox.module.scss';
import { VariableBoxHeader } from './VariableBoxHeader/VariableBoxHeader';
import { VariableBoxContent } from './VariableBoxContent/VariableBoxContent';
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
        />
      )}
    </div>
  );
}

export default VariableBox;
