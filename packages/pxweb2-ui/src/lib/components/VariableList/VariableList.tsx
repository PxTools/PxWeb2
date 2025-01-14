import cl from 'clsx';

import styles from './VariableList.module.scss';
import { SelectedVBValues, VariableBox } from '../VariableBox/VariableBox';
import { PxTableMetadata } from '../../shared-types/pxTableMetadata';
import { SelectOption } from '../Select/Select';
import { Value } from '../../shared-types/value';

export type VariableListProps = {
  pxTableMetadata: PxTableMetadata | null;
  isLoadingMetadata: boolean;
  hasLoadedDefaultSelection: boolean;
  isChangingCodeList: boolean;
  selectedVBValues: SelectedVBValues[];

  // TODO: Optimise here? Duplicate with props in VariableBox
  handleCodeListChange: (
    selectedItem: SelectOption | undefined,
    varId: string,
  ) => void;
  handleCheckboxChange: (varId: string, value: string) => void;
  handleMixedCheckboxChange: (
    varId: string,
    allValuesSelected: string,
    searchValues: Value[],
  ) => void;
  addModal: (name: string, closeFunction: () => void) => void;
  removeModal: (name: string) => void;
};

export function VariableList({
  pxTableMetadata,
  isLoadingMetadata,
  hasLoadedDefaultSelection,
  isChangingCodeList = false,
  selectedVBValues,
  handleCodeListChange,
  handleCheckboxChange,
  handleMixedCheckboxChange,
  addModal,
  removeModal,
}: VariableListProps) {
  return (
    <div
      className={cl(styles.variableList, {
        [styles.fadeVariableList]: isChangingCodeList,
      })}
    >
      {!isLoadingMetadata &&
        hasLoadedDefaultSelection &&
        pxTableMetadata &&
        pxTableMetadata.variables.length > 0 &&
        pxTableMetadata.variables.map(
          (variable, index) =>
            variable.id && (
              <VariableBox
                id={variable.id}
                key={variable.id + pxTableMetadata.id}
                initialIsOpen={index === 0}
                tableId={pxTableMetadata.id}
                label={variable.label}
                mandatory={variable.mandatory}
                type={variable.type}
                values={variable.values}
                codeLists={variable.codeLists}
                selectedValues={selectedVBValues}
                onChangeCodeList={handleCodeListChange}
                onChangeMixedCheckbox={handleMixedCheckboxChange}
                onChangeCheckbox={handleCheckboxChange}
                addModal={addModal}
                removeModal={removeModal}
              />
            ),
        )}
    </div>
  );
}

export default VariableList;
