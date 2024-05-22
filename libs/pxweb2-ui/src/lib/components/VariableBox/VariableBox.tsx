import { useState } from 'react';
import cl from 'clsx';

import classes from './VariableBox.module.scss';
import { SelectOption } from '../Select/Select';
import { VariableBoxHeader } from './VariableBoxHeader/VariableBoxHeader';
import { VariableBoxContent } from './VariableBoxContent/VariableBoxContent';
import { Variable } from '../../shared-types/variable';
import { Value } from '../../shared-types/value';

export type SelectedVBValues = {
  id: string;
  selectedCodeList: SelectOption | undefined;
  values: Value['code'][];
};

/* eslint-disable-next-line */
export type VariableBoxPropsBase = Omit<Variable, 'type' | 'notes'>;

export type VariableBoxProps = VariableBoxPropsBase & {
  onChangeCodeList: (selectedItem: SelectOption | undefined) => void;
  //selectedValues: Value['code'][];
  //setSelectedValues: (values: Value['code'][]) => void;
};

export function VariableBox({
  /*
   * A component that displays a variable with its values and code lists
   *
   * @param id - The id of the variable
   * @param label - The label of the variable
   * @param mandatory - Whether the variable is mandatory or not
   * @param values - The values of the variable
   * @param codeLists - The code lists of the variable
   * @param onChangeCodeList - The function to call when a code list is selected in VariableBoxContent's Select
   *
   * @returns A VariableBox component
   */
  id,
  label,
  mandatory = false,
  values,
  codeLists,
  onChangeCodeList,
}: //selectedValues,
//setSelectedValues,
VariableBoxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<SelectedVBValues[]>([]);

  const capitalizedVariableName =
    label.charAt(0).toUpperCase() + label.slice(1);
  const totalValues = values?.length;
  let totalChosenValues = 0;
  const chosenValuesLength = selectedValues.find(
    (variables) => variables.id === id
  )?.values.length;

  if (chosenValuesLength !== undefined) {
    totalChosenValues = chosenValuesLength;
  }

  return (
    <div className={cl(classes.variablebox)} key={id + '-variablebox'}>
      <VariableBoxHeader
        label={capitalizedVariableName}
        mandatory={mandatory}
        totalValues={totalValues}
        totalChosenValues={totalChosenValues}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={cl(classes['header-icon'])}
      />

      {isOpen && (
        <VariableBoxContent
          varId={id}
          label={capitalizedVariableName}
          values={values}
          codeLists={codeLists}
          selectedValues={selectedValues}
          setSelectedValues={setSelectedValues}
          //selectedCodeList={}
          totalValues={totalValues}
          totalChosenValues={totalChosenValues}
          onChangeCodeList={onChangeCodeList}
        />
      )}
    </div>
  );
}

export default VariableBox;
