import cl from 'clsx';
import { useState, useEffect } from 'react';

import classes from './Select.module.scss';
import Label from '../Typography/Label/Label';
import BodyShort from '../Typography/BodyShort/BodyShort';
import { Icon } from '../Icon/Icon';
import Modal from '../Modal/Modal';
import Radio from '../Radio/Radio';

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  variant?: 'default' | 'inVariableBox';
  label: string;
  modalHeading?: string;
  modalCancelLabel?: string;
  modalConfirmLabel?: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: SelectOption[];
  selectedOption?: SelectOption;
  onChange: (selectedItem: SelectOption | undefined) => void;
  tabIndex?: number;
  className?: string;
  addModal: (name: string, closeFunction: () => void) => void;
  removeModal: (name: string) => void;
};

function openOptions(options: SelectOption[]) {
  const optionsStr = options.map((option) => option.label).join('\n');
  console.log(optionsStr);
}

export function Select({
  variant = 'default',
  label,
  modalHeading = '',
  modalCancelLabel = '',
  modalConfirmLabel = '',
  hideLabel = false,
  placeholder = '',
  options: ops,
  selectedOption,
  onChange,
  tabIndex = 0,
  className = '',
  addModal,
  removeModal,
}: SelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <>
      {variant && variant === 'default' && (
        <DefaultSelect
          hideLabel={hideLabel}
          label={label}
          options={ops}
          placeholder={placeholder}
          selectedOption={selectedOption}
          onChange={onChange}
          tabIndex={tabIndex}
          className={cssClasses}
        />
      )}
      {variant && variant === 'inVariableBox' && (
        <VariableBoxSelect
          label={label}
          modalHeading={modalHeading}
          modalCancelLabel={modalCancelLabel}
          modalConfirmLabel={modalConfirmLabel}
          options={ops}
          placeholder={placeholder}
          selectedOption={selectedOption}
          onChange={onChange}
          tabIndex={tabIndex}
          className={cssClasses}
          addModal={addModal}
          removeModal={removeModal}
        />
      )}
    </>
  );
}

type DefaultSelectProps = Pick<
  SelectProps,
  | 'hideLabel'
  | 'label'
  | 'options'
  | 'placeholder'
  | 'selectedOption'
  | 'onChange'
  | 'tabIndex'
  | 'className'
>;

function DefaultSelect({
  hideLabel,
  label,
  options,
  placeholder,
  selectedOption,
  onChange,
  tabIndex,
  className = '',
}: DefaultSelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <div className={cl(classes.select) + cssClasses}>
      <div
        className={cl(classes.labelWrapper, {
          [classes.visuallyHidden]: hideLabel,
        })}
      >
        <Label size="medium" textcolor="default">
          {label}
        </Label>
      </div>
      <div
        className={cl(classes.contentStyle)}
        tabIndex={tabIndex}
        onClick={() => {
          openOptions(options); // TODO: Get option
          onChange(options[0]); // TODO: Use selected option
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            openOptions(options); // TODO: Get option
            onChange(options[0]); // TODO: Use selected option
          }
        }}
      >
        <BodyShort
          size="medium"
          className={cl(classes.optionLayout, classes.optionTypography)}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </BodyShort>
        <Icon iconName="ChevronDown" className=""></Icon>
      </div>
    </div>
  );
}

type VariableBoxSelectProps = Pick<
  SelectProps,
  | 'label'
  | 'modalHeading'
  | 'modalCancelLabel'
  | 'modalConfirmLabel'
  | 'options'
  | 'placeholder'
  | 'selectedOption'
  | 'onChange'
  | 'tabIndex'
  | 'className'
> & {
  addModal: (id: string, onClose: () => void) => void;
  removeModal: (name: string) => void;
};

function VariableBoxSelect({
  label,
  modalHeading,
  modalCancelLabel,
  modalConfirmLabel,
  options,
  placeholder,
  selectedOption,
  onChange,
  tabIndex,
  className = '',
  addModal,
  removeModal,
}: VariableBoxSelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<SelectOption | undefined>(
    selectedOption,
  );

  const selectedItem: SelectOption | undefined = selectedOption;

  const handleOpenModal = () => {
    setModalOpen(true);
    // Reset clicked item to selected item, incase user made changes and then closed the modal
    setClickedItem(selectedItem);
  };

  function handleRadioChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClickedItem(options.find((option) => option.value === e.target.value));
  }

  useEffect(() => {
    if (!isModalOpen) {
      removeModal('VariableBoxSelect');
    } else {
      addModal('VariableBoxSelect', () => {
        setModalOpen(false);
      });
    }
  }, [removeModal, isModalOpen]);

  const handleCloseModal = (updated: boolean) => {
    setModalOpen(false);
    if (updated) {
      onChange(clickedItem);
    } else {
      setClickedItem(selectedItem);
    }
  };

  return (
    <>
      <div
        className={cl(classes.selectVariabelbox) + cssClasses}
        tabIndex={tabIndex}
        role="button"
        aria-haspopup="dialog"
        onClick={() => {
          handleOpenModal();
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            handleOpenModal();
          }
        }}
      >
        <div className={cl(classes.textWrapper)}>
          <Label size="small" textcolor="default">
            {label}
          </Label>
          <BodyShort
            size="medium"
            className={cl(
              classes.optionLayoutVariablebox,
              classes.optionTypography,
            )}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </BodyShort>
        </div>
        <Icon iconName="ChevronDown" className=""></Icon>
      </div>
      <div className={cl(classes.divider)}></div>
      {isModalOpen && (
        <Modal
          label={label}
          heading={modalHeading}
          cancelLabel={modalCancelLabel}
          confirmLabel={modalConfirmLabel}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        >
          <Radio
            value={clickedItem?.value ?? ''}
            name="option"
            options={options}
            selectedOption={clickedItem?.value}
            onChange={handleRadioChange}
            variant="inModal"
          ></Radio>
        </Modal>
      )}
    </>
  );
}

export default Select;
