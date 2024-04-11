import cl from 'clsx';
import classes from './Select.module.scss';
import Label from '../Typography/Label/Label';
import Button from '../Button/Button';
import BodyShort from '../Typography/BodyShort/BodyShort';

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
  arialLabelButton?: string;
  className?: string;
}

function openOptions(options: SelectOption[]) {
  const optionsStr = options.map((option) => option.label).join('\n');
  alert(optionsStr);
}

export function Select({
  variant = 'default',
  label,
  hideLabel = false,
  defaultOption = '',
  options: ops,
  selectedOption,
  arialLabelButton = 'Show options',
  className = '',
}: SelectProps) {
  const cssClasses = className.length > 0 ? ' ' + className : '';
  
  if (selectedOption != null) {
    const selOption = ops.find(x => x.value === selectedOption);
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
            arialLabelButton,
            cssClasses
          )
        : VariableBoxSelect(
            label,
            ops,
            defaultOption,
            arialLabelButton,
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
  arialLabelButton: string,
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
      <div className={cl(classes.contentLayout, classes.contentStyle)}>
        <BodyShort
          size="medium"
          className={cl(classes.optionLayout, classes.optionTypography)}
        >
          {defaultOption}
        </BodyShort>
        <Button
          variant="tertiary"
          icon="ChevronDown"
          size="small"
          aria-label={arialLabelButton}
          onClick={() => openOptions(options)}
          className={cl(classes.buttonFocusHidden)}
        ></Button>
      </div>
    </div>
  );
}

function VariableBoxSelect(
  label: string,
  options: SelectOption[],
  defaultOption: string,
  arialLabelButton: string,
  cssClasses: string
) {
  return (
    <div className={cl(classes.selectVariabelbox) + cssClasses}>
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
      <Button
        variant="tertiary"
        icon="ChevronDown"
        size="small"
        aria-label={arialLabelButton}
        onClick={() => openOptions(options)}
        className={cl(classes.buttonFocusHidden)}
      ></Button>
    </div>
  );
}

export default Select;
