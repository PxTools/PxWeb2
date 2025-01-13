import React from 'react';
import cl from 'clsx';

import styles from './Checkbox.module.scss';
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
      onKeyDown={(event) => {
        if (event.key === ' ' || event.key === 'Enter') {
          event.preventDefault();
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
          [styles.checkmarkWithoutMargin]: noMargin,
        })}
      >
        {value && <Icon iconName="CheckMark"></Icon>}
      </span>
      <div className={styles.label} id={id + '-label'}>
        <span className={cl({ [styles.strong]: strong })}>
          <Highlight text={text} searchTerm={searchTerm} />
        </span>
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
      aria-checked={value}
      aria-labelledby={id + '-label'}
      aria-controls={ariaControls.join(' ')}
      className={cl(styles.checkboxWrapper, {
        [styles.inVariableBox]: inVariableBox,
      })}
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
          [styles.checkmarkWithoutMargin]: noMargin,
        })}
      >
        {value === 'true' && <Icon iconName="CheckMark"></Icon>}
        {value === 'mixed' && <Icon iconName="IndeterminateCheckMark"></Icon>}
      </span>
      <div
        className={cl(styles.label, { [styles.strong]: strong })}
        id={id + '-label'}
      >
        {text}
      </div>
    </div>
  );
};

interface HighlightProps {
  text: string;
  searchTerm?: string;
  highlightStyle?: React.CSSProperties;
}
const defaultHighlightStyle: React.CSSProperties = {
  backgroundColor: 'lightblue',
};
const Highlight: React.FC<HighlightProps> = ({
  text,
  searchTerm,
  highlightStyle = defaultHighlightStyle,
}) => {
  if (!searchTerm || searchTerm.length < 1) {
    return <span>{text}</span>;
  }
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={index} style={highlightStyle}>
            {part}
          </span>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        ),
      )}
    </span>
  );
};

export default Checkbox;
