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
  const [selectedValues, setSelectedValues] = useState<Value['code'][]>([]); // selectedValues should be handled in the parent component

  /** Maybe improve names? */
  const totalValues = values?.length;
  const totalChosenValues = selectedValues.length;
  const capitalizedVariableName =
    label.charAt(0).toUpperCase() + label.slice(1);

  return (
    <div className={cl(classes.variablebox)} key={id}>
      <VariableBoxHeader
        label={capitalizedVariableName}
        mandatory={mandatory}
        totalValues={totalValues}
        totalChosenValues={totalChosenValues}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />

      {isOpen && (
        <VariableBoxContent
          id={id}
          label={capitalizedVariableName}
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
