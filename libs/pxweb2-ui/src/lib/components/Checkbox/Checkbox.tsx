import React from 'react';
import styles from './Checkbox.module.scss';
import { Icon } from '../Icon/Icon';
import Label from '../Typography/Label/Label';

interface CheckboxProps {
  id: string;
  text: string;
  value: boolean;
  onChange: (str: boolean) => void;
  tabIndex?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  value,
  text,
  onChange,
  tabIndex,
}) => {
  const [checked, setChecked] = React.useState(value);

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      aria-labelledby={id + '-label'}
      className={styles.checkboxWrapper}
      tabIndex={tabIndex ? tabIndex : 0}
      onKeyUp={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
          setChecked(!checked);
          onChange(checked);
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        setChecked(!checked);
      }}
    >
      <span className={styles.checkmark}>
        {checked && <Icon iconName="CheckMark"></Icon>}
      </span>
      <span id={id + '-label'}>
        <Label>{text}</Label>
      </span>
    </div>
  );
};

export default Checkbox;
