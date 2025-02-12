import cl from 'clsx';
import { useState, useEffect, useRef } from 'react';

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
}: Readonly<SelectProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <>
      {variant === 'default' && (
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
      {variant === 'inVariableBox' && (
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
}: Readonly<DefaultSelectProps>) {
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

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [clickedItem, setClickedItem] = useState<SelectOption | undefined>(
    selectedOption,
  );

  const selectedItem: SelectOption | undefined = selectedOption;

  const handleOpenModal = () => {
    setIsModalOpen(true);

    // Reset clicked item to selected item, incase user made changes and then closed the modal
    setClickedItem(selectedItem);
  };

  const handleCloseModal = (
    updated: boolean,
    keyPress?: ' ' | 'Enter' | 'Escape',
  ) => {
    if (keyPress) {
      handleCloseModalWithKeyPress(keyPress);
    }

    setIsModalOpen(false);
    if (updated) {
      onChange(clickedItem);
    } else {
      setClickedItem(selectedItem);
    }
  };

  function handleCloseModalWithKeyPress(keyPress: ' ' | 'Enter' | 'Escape') {
    // Set focus back to the select element
    if (
      selectRef.current &&
      (keyPress === ' ' || keyPress === 'Enter' || keyPress === 'Escape')
    ) {
      programmaticFocusRef.current = true;

      // This hack is needed to ensure that the focus is set correctly,
      // otherwise the focus will be set during render and be gone before the render phase is done
      setTimeout(() => {
        selectRef.current?.focus();
      }, 0);
    }
  }

  function handleRadioChange(e: React.ChangeEvent<HTMLInputElement>) {
    setClickedItem(options.find((option) => option.value === e.target.value));
  }

  const selectRef = useRef<HTMLDivElement>(null);
  const selectedRadioOptionRef = useRef<HTMLInputElement>(null);
  const programmaticFocusRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isModalOpen) {
      removeModal('VariableBoxSelect');
    } else {
      addModal('VariableBoxSelect', () => {
        // Hack for correct focus handling when closing the modal with the escape key
        setTimeout(() => {
          setIsModalOpen(false);
        }, 0);
      });

      // Set focus to the radio button for the selected option when the modal is opened
      if (selectedRadioOptionRef.current) {
        selectedRadioOptionRef.current.focus();
      }
    }
  }, [removeModal, isModalOpen, addModal]);

  return (
    <>
      <div
        className={cl(classes.selectVariabelbox) + cssClasses}
        tabIndex={tabIndex}
        role="button"
        aria-haspopup="dialog"
        ref={selectRef}
        onClick={(event) => {
          if (programmaticFocusRef.current) {
            programmaticFocusRef.current = false;
            event.preventDefault();
            return;
          }
          handleOpenModal();
        }}
        onKeyUp={(event) => {
          if (event.key === ' ') {
            handleOpenModal();
          }
        }}
        onKeyDown={(event) => {
          if (event.key === ' ') {
            event.preventDefault(); // Prevent scrolling with spacebar
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
            ref={selectedRadioOptionRef}
            onChange={handleRadioChange}
            variant="inModal"
          ></Radio>
        </Modal>
      )}
    </>
  );
}

export default Select;
