import cl from 'clsx';
import { useState } from 'react';

import classes from './Select.module.scss';
import Label from '../Typography/Label/Label';
import BodyShort from '../Typography/BodyShort/BodyShort';
import { Icon } from '../Icon/Icon';
import Modal from '../Modal/Modal';

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectProps = {
  variant?: 'default' | 'inVariableBox';
  label: string;
  hideLabel?: boolean;
  placeholder?: string;
  options: SelectOption[];
  selectedOption?: SelectOption;
  onChange: (selectedItem: SelectOption) => void;
  tabIndex?: number;
  className?: string;
};

function openOptions(options: SelectOption[]) {
  const optionsStr = options.map((option) => option.label).join('\n');
  console.log(optionsStr);
}

export function Select({
  variant = 'default',
  label,
  hideLabel = false,
  placeholder = '',
  options: ops,
  selectedOption,
  onChange,
  tabIndex = 0,
  className = '',
}: SelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  if (selectedOption != null) {
    // TODO: rewright
    const selOption = ops.find((x) => x.value === selectedOption.value);
    if (selOption != null) {
      placeholder = selOption.label;
    }
  }

  return (
    <>
      {variant && variant === 'default' && (
        <DefaultSelect
          hideLabel={hideLabel}
          label={label}
          options={ops}
          placeholder={placeholder}
          onChange={onChange}
          tabIndex={tabIndex}
          className={cssClasses}
        />
      )}
      {variant && variant === 'inVariableBox' && (
        <VariableBoxSelect
          label={label}
          options={ops}
          placeholder={placeholder}
          selectedOption={selectedOption}
          onChange={onChange}
          tabIndex={tabIndex}
          className={cssClasses}
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
  | 'onChange'
  | 'tabIndex'
  | 'className'
>;

function DefaultSelect({
  hideLabel,
  label,
  options,
  placeholder,
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
        onClick={(event) => {
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
          {placeholder}
        </BodyShort>
        <Icon iconName="ChevronDown" className=""></Icon>
      </div>
    </div>
  );
}

type VariableBoxSelectProps = Pick<
  SelectProps,
  | 'label'
  | 'options'
  | 'placeholder'
  | 'selectedOption'
  | 'onChange'
  | 'tabIndex'
  | 'className'
>;

function VariableBoxSelect({
  label,
  options,
  placeholder,
  selectedOption,
  onChange,
  tabIndex,
  className = '',
}: VariableBoxSelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<SelectOption | undefined>(
    selectedOption
  );
  const [clickedItem, setClickedItem] = useState<SelectOption | undefined>(
    selectedOption
  );

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log(selectedItem);
    setSelectedItem(clickedItem);
    setModalOpen(false);
  };

  return (
    <>
      <div
        className={cl(classes.selectVariabelbox) + cssClasses}
        tabIndex={tabIndex}
        onClick={(event) => {
          handleOpenModal();
          //openOptions(options); // TODO: Get option
          onChange(options[0]); // TODO: Use selected option
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            //openOptions(options); // TODO: Get option
            handleOpenModal();
            onChange(options[0]); // TODO: Use selected option
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
              classes.optionTypography
            )}
          >
            {selectedItem ? selectedItem.label : placeholder}
          </BodyShort>
        </div>
        <Icon iconName="ChevronDown" className=""></Icon>
      </div>
      <div className={cl(classes.divider)}></div>
      <Modal hasCloseBtn={true} isOpen={isModalOpen} onClose={handleCloseModal}>
        {options.map((option) => (
          <div key={option.value}>
            <input
              type="radio"
              id={option.value}
              name="option"
              value={option.value}
              key={option.value}
              checked={option.value === clickedItem?.value}
              onChange={() => {
                setClickedItem(option);
              }}
            />
            <label htmlFor={option.value}>{option.label}</label>
          </div>
        ))}
      </Modal>
    </>
  );
}

export default Select;
