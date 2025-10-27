import React from 'react';
import cl from 'clsx';

import styles from './Checkbox.module.scss';
import { Highlight } from './Highlight/Highlight';
import { Icon } from '../Icon/Icon';

interface CheckboxProps {
  id: string;
  text: string;
  searchTerm?: string;
  value: boolean;
  onChange: (str: boolean) => void;
  tabIndex?: number;
  strong?: boolean;
  noMargin?: boolean;
  subtle?: boolean;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  value,
  text,
  searchTerm,
  onChange,
  tabIndex,
  strong,
  noMargin,
  subtle,
}) => {
  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={value}
      aria-labelledby={id + '-label'}
      aria-disabled={subtle}
      className={cl(styles.checkboxWrapper, {
        [styles[`subtle`]]: subtle,
      })}
      tabIndex={subtle ? -1 : (tabIndex ?? 0)}
      onKeyUp={(event) => {
        if (event.key === ' ' && !subtle) {
          event.preventDefault();
          onChange(!value);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === ' ' && !subtle) {
          event.preventDefault();
        }
      }}
      onClick={(event) => {
        event.preventDefault();
        if (!subtle) {
          onChange(!value);
        }
      }}
    >
      <span
        className={cl(styles.checkmark, {
          [styles.checked]: value,
          [styles.checkmarkWithoutMargin]: noMargin,
        })}
      >
        {value && (
          <Icon
            iconName="CheckMark"
            className={cl({ [styles.iconChecked]: value })}
          ></Icon>
        )}
      </span>
      <div className={styles.label} id={id + '-label'}>
        <span className={cl({ [styles.strong]: strong })}>
          <Highlight text={text} searchTerm={searchTerm} />
        </span>
      </div>
    </div>
  );
};

export type MixedValue = 'mixed' | 'false' | 'true';
interface MixedCheckboxProps {
  id: string;
  text: string;
  value: MixedValue;
  onChange: (str: MixedValue) => void;
  ariaControls: string[];
  tabIndex?: number;
  strong?: boolean;
  noMargin?: boolean;
  inVariableBox?: boolean;
}
export const MixedCheckbox: React.FC<MixedCheckboxProps> = ({
  id,
  value,
  text,
  onChange,
  ariaControls,
  tabIndex,
  strong,
  noMargin,
  inVariableBox = false,
}) => {
  return (
    <div
      id={id}
      role="checkbox"
      aria-checked={value === 'true'}
      aria-labelledby={id + '-label'}
      aria-controls={ariaControls.join(' ')}
      className={cl(styles.checkboxWrapper, {
        [styles.inVariableBox]: inVariableBox,
      })}
      tabIndex={tabIndex ?? 0}
      onKeyUp={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
          if (value === 'false') {
            onChange('true');
          }
          if (value === 'mixed' || value === 'true') {
            onChange('false');
          }
        }
      }}
      onKeyDown={(event) => {
        if (event.key === ' ') {
          event.preventDefault();
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
          [styles.checked]: value === 'true',
          [styles.checkmarkWithoutMargin]: noMargin,
        })}
      >
        {value === 'true' && (
          <Icon
            iconName="CheckMark"
            className={cl({ [styles.iconChecked]: value === 'true' })}
          ></Icon>
        )}
      </span>
      <div
        className={cl(styles.label, { [styles.strong]: strong })}
        id={id + '-label'}
      >
        {text}
      </div>
      <div className={styles.checkboxBackgroundCover}></div>
    </div>
  );
};

export default Checkbox;
