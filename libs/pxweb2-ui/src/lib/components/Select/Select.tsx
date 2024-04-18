import cl from 'clsx';

import classes from './Select.module.scss';
import Label from '../Typography/Label/Label';
import BodyShort from '../Typography/BodyShort/BodyShort';
import { Icon } from '../Icon/Icon';

export type SelectOption = {
  label: string;
  value: string;
};

export interface SelectProps {
  variant?: 'default' | 'inVariableBox';
  label: string;
  hideLabel?: boolean;
  defaultOption?: string;
  options: SelectOption[];
  selectedOption?: string;
  onChange: (selectedItem: SelectOption) => void;
  tabIndex?: number;
  className?: string;
}

function openOptions(options: SelectOption[]) {
  const optionsStr = options.map((option) => option.label).join('\n');
  console.log(optionsStr);
}

export function Select({
  variant = 'default',
  label,
  hideLabel = false,
  defaultOption = '',
  options: ops,
  selectedOption,
  onChange,
  tabIndex = 0,
  className = '',
}: SelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';

  if (selectedOption != null) {
    const selOption = ops.find((x) => x.value === selectedOption);
    if (selOption != null) {
      defaultOption = selOption.label;
    }
  }

  return (
    <div>
      {variant === 'default'
        ? DefaultSelect(
            hideLabel,
            label,
            ops,
            defaultOption,
            onChange,
            tabIndex,
            cssClasses
          )
        : VariableBoxSelect(
            label,
            ops,
            defaultOption,
            onChange,
            tabIndex,
            cssClasses
          )}
    </div>
  );
}

function DefaultSelect(
  hideLabel: boolean,
  label: string,
  options: SelectOption[],
  defaultOption: string,
  onChange: (selectedItem: SelectOption) => void,
  tabIndex: number,
  cssClasses: string
) {
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
          {defaultOption}
        </BodyShort>
        <Icon iconName="ChevronDown" className=""></Icon>
      </div>
    </div>
  );
}

function VariableBoxSelect(
  label: string,
  options: SelectOption[],
  defaultOption: string,
  onChange: (selectedItem: SelectOption) => void,
  tabIndex: number,
  cssClasses: string
) {
  return (
    <>
      <div
        className={cl(classes.selectVariabelbox) + cssClasses}
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
            {defaultOption}
          </BodyShort>
        </div>
        <Icon iconName="ChevronDown" className=""></Icon>
      </div>
      <div className={cl(classes.divider)}></div>
    </>
  );
}

export default Select;
