import { useState } from 'react';
import cl from 'clsx';

import classes from './VariableBox.module.scss';
import { SelectOption } from '../Select/SelectOptionType';
import { VariableBoxHeader } from './VariableBoxHeader/VariableBoxHeader';
import { VariableBoxContent } from './VariableBoxContent/VariableBoxContent';
import { Variable } from '../../shared-types/variable';
import { Value } from '../../shared-types/value';

export type SelectedVBValues = {
  id: string;
  selectedCodeList: string | undefined;
  values: Value['code'][];
};

export type VariableBoxPropsBase = Omit<Variable, 'notes'>;

export type VariableBoxProps = VariableBoxPropsBase & {
  tableId: string;
  languageDirection: 'ltr' | 'rtl';
  initialIsOpen?: boolean;
  onChangeCodeList: (
    selectedItem: SelectOption | undefined,
    varId: string,
  ) => void;
  onChangeCheckbox: (varId: string, value: string) => void;
  onChangeMixedCheckbox: (
    varId: string,
    allValuesSelected: string,
    searchValues: Value[],
  ) => void;
  selectedValues: SelectedVBValues[];
  addModal: (name: string, closeFunction: () => void) => void;
  removeModal: (name: string) => void;
};

export function VariableBox({
  id,
  initialIsOpen,
  tableId,
  label,
  languageDirection,
  mandatory = false,
  type,
  values,
  codeLists,
  selectedValues,
  onChangeCodeList,
  onChangeCheckbox,
  onChangeMixedCheckbox,
  addModal,
  removeModal,
}: VariableBoxProps) {
  const [isOpen, setIsOpen] = useState(!!initialIsOpen);
  const [prevTableId, setPrevTableId] = useState<string>(tableId);

  const capitalizedVariableName =
    label.charAt(0).toUpperCase() + label.slice(1);
  const totalValues = values?.length;
  let totalChosenValues = 0;
  const chosenValuesLength = selectedValues.find(
    (variables) => variables.id === id,
  )?.values.length;
  const currentVariable = selectedValues.find((variable) => variable.id === id);
  const isMissingMandatoryValueError =
    mandatory && (currentVariable?.values.length === 0 || !currentVariable);

  if (prevTableId !== tableId) {
    setIsOpen(false);
    setPrevTableId(tableId);
  }

  if (chosenValuesLength !== undefined) {
    totalChosenValues = chosenValuesLength;
  }

  return (
    <div
      className={cl(
        classes.variablebox,
        isMissingMandatoryValueError && classes['error'],
      )}
      key={id + '-variablebox'}
    >
      <VariableBoxHeader
        label={capitalizedVariableName}
        mandatory={mandatory}
        totalValues={totalValues}
        totalChosenValues={totalChosenValues}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={cl(classes['header-icon'])}
        isMissingMandatoryValues={isMissingMandatoryValueError}
      />

      {isOpen && (
        <VariableBoxContent
          varId={id}
          type={type}
          label={capitalizedVariableName}
          languageDirection={languageDirection}
          values={values}
          codeLists={codeLists}
          selectedValues={selectedValues}
          totalValues={totalValues}
          totalChosenValues={totalChosenValues}
          onChangeCodeList={onChangeCodeList}
          onChangeMixedCheckbox={onChangeMixedCheckbox}
          onChangeCheckbox={onChangeCheckbox}
          addModal={addModal}
          removeModal={removeModal}
        />
      )}
    </div>
  );
}

export default VariableBox;
