import cl from 'clsx';
import { useState, useEffect, useRef } from 'react';

import classes from './Select.module.scss';
import { SelectOption } from './SelectOptionType';
import Label from '../Typography/Label/Label';
import BodyShort from '../Typography/BodyShort/BodyShort';
import { Icon } from '../Icon/Icon';
import Modal from '../Modal/Modal';
import Radio from '../Radio/Radio';
import { getIconDirection } from '../../util/util';
import i18next from 'i18next';

export type SelectProps = {
  variant?: 'default' | 'inVariableBox';
  label: string;
  languageDirection?: 'ltr' | 'rtl';
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
  codeListLabelId?: string;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function openOptions(options: SelectOption[]) {
  // NOSONAR: Keep for future use
  // const optionsStr = options.map((option) => option.label).join('\n');
}

export function Select({
  variant = 'default',
  label,
  languageDirection = 'ltr',
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
  codeListLabelId,
}: Readonly<SelectProps>) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  return (
    <>
      {variant === 'default' && (
        <DefaultSelect
          hideLabel={hideLabel}
          label={label}
          options={ops}
          selectedOption={selectedOption}
          tabIndex={tabIndex}
          className={cssClasses}
        />
      )}
      {variant === 'inVariableBox' && (
        <VariableBoxSelect
          label={label}
          languageDirection={languageDirection}
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
          codeListLabelId={codeListLabelId}
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
  | 'selectedOption'
  | 'tabIndex'
  | 'className'
>;

function DefaultSelect({
  hideLabel,
  label,
  options,
  selectedOption,
  tabIndex = 0,
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

      <div className={cl(classes.selectWrapper)}>
        <select
          aria-label={label}
          className={cl(classes.optionLayout, classes['bodyshort-medium'])}
          defaultValue={
            selectedOption ? String(selectedOption.value) : undefined
          }
        >
          {options.map((o) => (
            <option
              key={String(o.value)}
              value={String(o.value)}
              className={cl(classes['bodyshort-medium'])}
              tabIndex={tabIndex}
              // Use uncontrolled select with initial value from selectedOption
              defaultValue={
                selectedOption ? String(selectedOption.value) : undefined
              }
            >
              {o.label}
            </option>
          ))}
        </select>
        <Icon
          iconName="ChevronDown"
          className={cl(
            classes.iconColor,
          )}
        ></Icon>
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
  | 'codeListLabelId'
> & {
  languageDirection: 'ltr' | 'rtl';
  addModal: (id: string, onClose: () => void) => void;
  removeModal: (name: string) => void;
};

function VariableBoxSelect({
  label,
  languageDirection,
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
  codeListLabelId,
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

  // handle rtl for the icon
  const chevronIcon = getIconDirection(
    languageDirection,
    'ChevronRight',
    'ChevronLeft',
  );

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
            id={codeListLabelId}
            className={cl(
              classes.optionLayoutVariablebox,
              classes.optionTypography,
            )}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </BodyShort>
        </div>
        <Icon
          iconName={chevronIcon}
          className={cl(
            classes.iconColor,
            i18next.dir() === 'rtl' ? classes.rtl : classes.ltr,
          )}
        ></Icon>
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
            inModal={true}
            legend={modalHeading ?? ''}
          ></Radio>
        </Modal>
      )}
    </>
  );
}

export default Select;
