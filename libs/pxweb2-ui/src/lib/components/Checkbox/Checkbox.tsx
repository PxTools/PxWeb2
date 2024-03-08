import React from 'react';
import cl from 'clsx';
import styles from './Checkbox.module.scss';
import { Icon } from '../Icon/Icon';
import Label from '../Typography/Label/Label';

interface CheckboxProps {
  id: string;
  text: string;
  value: boolean;
  onChange: (str: boolean) => void;
  tabIndex?: number;
  strong?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  value,
  text,
  onChange,
  tabIndex,
  strong,
}) => {
  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={value}
      aria-labelledby={id + '-label'}
      className={styles.checkboxWrapper}
      tabIndex={tabIndex ? tabIndex : 0}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          onChange(!value);
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        onChange(!value);
      }}
    >
      <span
        className={cl(styles.checkmark, {
          [styles.checked]: value,
        })}
      >
        {value && <Icon iconName="CheckMark"></Icon>}
      </span>
      <div className={styles.label} id={id + '-label'}>
        <Label>
          <span className={cl({ [styles.strong]: strong })}>{text}</span>
        </Label>
      </div>
    </div>
  );
};
interface MixedCheckboxProps {
  id: string;
  text: string;
  value: 'mixed' | 'false' | 'true';
  onChange: (str: string) => void;
  ariaControls: string[];
  tabIndex?: number;
  strong?: boolean;
}
export const MixedCheckbox: React.FC<MixedCheckboxProps> = ({
  id,
  value,
  text,
  onChange,
  ariaControls,
  tabIndex,
  strong,
}) => {
  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={value}
      aria-labelledby={id + '-label'}
      aria-controls={ariaControls.join(' ')}
      className={styles.checkboxWrapper}
      tabIndex={tabIndex ? tabIndex : 0}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          if (value === 'false') {
            onChange('true');
          }
          if (value === 'mixed' || value === 'true') {
            onChange('false');
          }
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        if (value === 'false') {
          onChange('true');
        }
        if (value === 'mixed' || value === 'true') {
          onChange('false');
        }
      }}
    >
      <span
        className={cl(styles.checkmark, {
          [styles.checked]: value === 'mixed' || value === 'true',
        })}
      >
        {value === 'true' && <Icon iconName="CheckMark"></Icon>}
        {value === 'mixed' && <Icon iconName="IndeterminateCheckMark"></Icon>}
      </span>
      <div className={styles.label} id={id + '-label'}>
        <Label>
          <span className={cl({ [styles.strong]: strong })}>{text}</span>
        </Label>
      </div>
    </div>
  );
};

export default Checkbox;
