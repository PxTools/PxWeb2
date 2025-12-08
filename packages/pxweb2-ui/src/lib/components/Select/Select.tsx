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
  | 'placeholder'
  | 'selectedOption'
  | 'onChange'
  | 'tabIndex'
  | 'className'
>;


// function DefaultSelect({
//   hideLabel,
//   label,
//   options,
//   placeholder,
//   selectedOption,
//   onChange,
//   tabIndex,
//   className = '',
// }: Readonly<DefaultSelectProps>) {
//   const cssClasses = className.length > 0 ? ' ' + className : '';

//   return (

//     <div className={cl(classes.select) + cssClasses}>
//       <div
//         className={cl(classes.labelWrapper, {
//           [classes.visuallyHidden]: hideLabel,
//         })}
//       >
//         <Label size="medium" textcolor="default">
//           {label}
//         </Label>
//       </div>


//       <div
//         className={cl(classes.contentStyle)}
//         tabIndex={tabIndex}
//         onClick={() => {
//           openOptions(options); // TODO: Get option
//           onChange(options[0]); // TODO: Use selected option
//         }}
//         onKeyUp={(event) => {
//           if (event.key === ' ' || event.key === 'Enter') {
//             openOptions(options); // TODO: Get option
//             onChange(options[0]); // TODO: Use selected option
//           }
//         }}
//       >
//         <BodyShort
//           size="medium"
//           className={cl(classes.optionLayout, classes.optionTypography)}
//         >
//           {selectedOption ? selectedOption.label : placeholder}
//         </BodyShort>
//         <Icon iconName="ChevronDown" className={cl(classes.iconColor)}></Icon>
//       </div>
//     </div>
//   );
// }




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
             <select
            // {...omit(rest, ["error", "errorId", "size", "readOnly"])}
            // {...inputProps}
            // {...readOnlyEventHandlers}
            //ref={ref}
            aria-label={label}
          className={cl(classes.optionLayout, classes.optionTypography)}
          >
            {options.map((o) => (
              <option key={String(o.value)} value={String(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        <BodyShort
          size="medium"
          className={cl(classes.optionLayout, classes.optionTypography)}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </BodyShort>
        <Icon iconName="ChevronDown" className={cl(classes.iconColor)}></Icon>
      </div>
    </div>
  );
}





// // // ...existing code...
// function DefaultSelect({
//   hideLabel,
//   label,
//   options,
//   placeholder,
//   selectedOption,
//   onChange,
//   tabIndex,
//   className = '',
// }: Readonly<DefaultSelectProps>) {
//   const cssClasses = className.length > 0 ? ' ' + className : '';

// const size = 'medium'; // default size

//   // Internal fallback when component is used uncontrolled
//   const [internalSelected, setInternalSelected] = useState<SelectOption | undefined>(selectedOption);

//   // Sync internal state if parent controls it
//   useEffect(() => {
//     setInternalSelected(selectedOption);
//   }, [selectedOption]);

//   const activeSelection = internalSelected;
//   const displayedLabel = activeSelection
//     ? options.find(o => String(o.value) === String(activeSelection.value))?.label ?? activeSelection.label
//     : placeholder;

//   return (
//           <div
//         // className={cl(
//         //   className,
//         //   "navds-form-field",
//         //   `navds-form-field--${size}`,
//         //   {
//         //     "navds-form-field--disabled": !!inputProps.disabled,
//         //     "navds-form-field--readonly": readOnly,
//         //     "navds-select--error": hasError,
//         //     "navds-select--readonly": readOnly,
//         //   },
//         // )}
//       >
//         <Label
//           htmlFor={tabIndex ? undefined : undefined }
//           size={size}
//           className={cl("navds-form-field__label", {
//             "navds-sr-only": hideLabel,
//           })}
//         >
//           {label}
//         </Label>
//         {/* {!!label && (
//           <BodyShort
//             className={cl("navds-form-field__description", {
//               "navds-sr-only": hideLabel,
//             })}
//             id={tabIndex ? undefined : undefined }
//             size={size}
//           >
//             {label}
//           </BodyShort>
//         )} */}
//         <div className={cl("navds-select__container")}
//         // <div className={cl("classes.selectNative")}
//         // style={style}
//         >
//           <select
//             // {...omit(rest, ["error", "errorId", "size", "readOnly"])}
//             // {...inputProps}
//             // {...readOnlyEventHandlers}
//             //ref={ref}
//             aria-label={label}
//             className={cl(
//               "classes.selectNative",
//               "navds-select__input",
//               "navds-body-short",
//               `navds-body-short--${size ?? "medium"}`,
//             )}
//           >
//             {options.map((o) => (
//               <option key={String(o.value)} value={String(o.value)}>
//                 {o.label}
//               </option>
//             ))}
//           </select>
//            {/* <Icon
//            iconName="ChevronDown"
//              className={cl(classes.iconColor, classes.selectIcon)}
//            aria-hidden="true"
//          /> */}
//         </div>
//       </div>





//     // <div className={cl(classes.select) + cssClasses}>
//     //   <div
//     //     className={cl(classes.labelWrapper, {
//     //       [classes.visuallyHidden]: hideLabel,
//     //     })}
//     //   >
//     //     <Label size="medium" textcolor="default">
//     //       {label}
//     //     </Label>
//     //   </div>
//     //   <div className={cl(classes.contentStyle)} tabIndex={tabIndex}>
//     //     <BodyShort
//     //       size="medium"
//     //       className={cl(classes.optionLayout, classes.optionTypography)}
//     //     >
//     //       {displayedLabel}
//     //     </BodyShort>
//     //     <Icon iconName="ChevronDown" className={cl(classes.iconColor)}></Icon>
//     //     <select
//     //       className={cl(classes.selectNative)}
//     //       aria-label={label}
//     //       value={activeSelection ? String(activeSelection.value) : ''}
//     //       onChange={(e) => {
//     //         const opt = options.find(o => String(o.value) === e.target.value);
//     //         setInternalSelected(opt);      // update internal
//     //         onChange(opt);                 // notify parent
//     //       }}
//     //       tabIndex={tabIndex}
//     //     >
//     //       {placeholder && (
//     //         <option value="" disabled hidden>
//     //           {placeholder}
//     //         </option>
//     //       )}
//     //       {options.map((o) => (
//     //         <option key={String(o.value)} value={String(o.value)}>
//     //           {o.label}
//     //         </option>
//     //       ))}
//     //     </select>
//     //   </div>

//     //   <div className={cl(classes.selectWrapper)}>

//     //     <select
//     //       tabIndex={tabIndex}
//     //       className={cl(classes.selectNative)}
//     //       aria-label={label}
//     //       value={activeSelection ? String(activeSelection.value) : ''}
//     //       onChange={(e) => {
//     //         const opt = options.find(o => String(o.value) === e.target.value);
//     //         setInternalSelected(opt);      // update internal
//     //         onChange(opt);                 // notify parent
//     //       }}
//     //     >
//     //       {placeholder && (
//     //         <option value="" disabled hidden>
//     //           {placeholder}
//     //         </option>
//     //       )}
//     //       {options.map((o) => (
//     //         <option key={String(o.value)} value={String(o.value)}>
//     //           {o.label}
//     //         </option>
//     //       ))}
//     //     </select>
//     //      <Icon
//     //       iconName="ChevronDown"
//     //         className={cl(classes.iconColor, classes.selectIcon)}
//     //       aria-hidden="true"
//     //     />
//     //   </div>
//     //     </div>

//   );
// }
// // ...existing code...



// // function DefaultSelect({
// //   hideLabel,
// //   label,
// //   options,
// //   placeholder,
// //   selectedOption,
// //   onChange,
// //   tabIndex,
// //   className = '',
// // }: Readonly<DefaultSelectProps>) {
// //   const cssClasses = className.length > 0 ? ' ' + className : '';

// //   return (

// // <p>
// //     <label >Select pet:</label>
// //     <select id="pet-select">
// //       <button>
// //         <selectedcontent></selectedcontent>
// //       </button>

// //       <option value="">Please select a pet</option>
// //       <option value="cat">
// //         <span className={cl(classes.icon)} aria-hidden="true">🐱</span
// //         ><span class="option-label">Cat</span>
// //       </option>
// //       <option value="dog">
// //         <span className={cl(classes.icon)} aria-hidden="true">🐶</span
// //         ><span class="option-label">Dog</span>
// //       </option>
// //       <option value="hamster">
// //         <span className={cl(classes.icon)} aria-hidden="true">🐹</span
// //         ><span class="option-label">Hamster</span>
// //       </option>
// //       <option value="chicken">
// //         <span className={cl(classes.icon)} aria-hidden="true">🐔</span
// //         ><span class="option-label">Chicken</span>
// //       </option>
// //       <option value="fish">
// //         <span className={cl(classes.icon)} aria-hidden="true">🐟</span
// //         ><span class="option-label">Fish</span>
// //       </option>
// //       <option value="snake">
// //         <span class="icon" aria-hidden="true">🐍</span
// //         ><span class="option-label">Snake</span>
// //       </option>
// //     </select>
// //   </p>

// //     // <div className={cl(classes.select) + cssClasses}>
// //     //   <div
//     //     className={cl(classes.labelWrapper, {
//     //       [classes.visuallyHidden]: hideLabel,
//     //     })}
//     //   >
//     //     <Label size="medium" textcolor="default">
//     //       {label}
//     //     </Label>
//     //   </div>


//     //   <div
//     //     className={cl(classes.contentStyle)}
//     //     tabIndex={tabIndex}
//     //     onClick={() => {
//     //       openOptions(options); // TODO: Get option
//     //       onChange(options[0]); // TODO: Use selected option
//     //     }}
//     //     onKeyUp={(event) => {
//     //       if (event.key === ' ' || event.key === 'Enter') {
//     //         openOptions(options); // TODO: Get option
//     //         onChange(options[0]); // TODO: Use selected option
//     //       }
//     //     }}
//     //   >
//     //     <BodyShort
//     //       size="medium"
//     //       className={cl(classes.optionLayout, classes.optionTypography)}
//     //     >
//     //       {selectedOption ? selectedOption.label : placeholder}
//     //     </BodyShort>
//     //     <Icon iconName="ChevronDown" className={cl(classes.iconColor)}></Icon>
//     //   </div>
//     // </div>
// //  );
// //}


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
        <Icon iconName={chevronIcon} className={cl(classes.iconColor)}></Icon>
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
            legend={modalHeading ?? ''}
          ></Radio>
        </Modal>
      )}
    </>
  );
}

export default Select;
