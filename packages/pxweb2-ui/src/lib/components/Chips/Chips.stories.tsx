import { Meta } from '@storybook/react';
import { useState, useEffect } from 'react';

import { Chips } from './Chips';

const meta: Meta<typeof Chips> = {
  title: 'Components/Chips',
  component: Chips,
};
export default meta;

const removableChips = [
  'Byggekostnadsindeks for røyrleggjararbeid i kontor- og forretningsbygg',
  'Kommune',
  'Måned',
];
const toggleChips = ['.xlxs', '.csv', '.html'];

interface StoryProps {
  type?: 'toggle' | 'removable';
  filled?: boolean;
  checkmark?: boolean;
  truncate?: boolean;
}

const handleToggleClick = (
  selected: number[],
  setSelected: React.Dispatch<React.SetStateAction<number[]>>,
  value: number,
) => {
  setSelected(
    selected.includes(value)
      ? selected.filter((x) => x !== value)
      : [...selected, value],
  );
};

const handleRemovableClick = (
  options: string[],
  setOptions: React.Dispatch<React.SetStateAction<string[]>>,
  value: string,
) => {
  setOptions(options.filter((y) => y !== value));
};

export const Default = (props: StoryProps) => {
  const [selected, setSelected] = useState<number[]>([1, 2]);
  const [options, setOptions] = useState(toggleChips);

  useEffect(() => {
    if (props.type !== 'toggle') {
      setOptions(removableChips);
    }
  }, [props.type]);

  if (props.type === 'toggle') {
    return (
      <Chips>
        {options.map((c, i) => (
          <Chips.Toggle
            selected={selected.includes(i)}
            checkmark={props.checkmark}
            key={c}
            onClick={() => handleToggleClick(selected, setSelected, i)}
          >
            {c}
          </Chips.Toggle>
        ))}
      </Chips>
    );
  }

  return (
    <Chips>
      {options.map((c) => (
        <Chips.Removable
          filled={props.filled}
          key={c}
          onClick={() => handleRemovableClick(options, setOptions, c)}
          truncate={props.truncate}
        >
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};
Default.argTypes = {
  type: {
    control: { type: 'radio' },
    options: ['toggle', 'removable'],
  },
  checkmark: {
    control: { type: 'boolean' },
    if: { arg: 'type', eq: 'toggle' },
  },
  filled: {
    control: { type: 'boolean' },
    if: { arg: 'type', eq: 'removable' },
  },
  truncate: {
    control: { type: 'boolean' },
    description: 'Truncate text if it is too long',
    if: { arg: 'type', eq: 'removable' },
  },
};

Default.args = {
  type: 'toggle',
  checkmark: true,
  filled: false,
  truncate: false,
};

export const ToggleCheckmark = () => {
  const [selected, setSelected] = useState<number[]>([2, 4]);
  return (
    <Chips>
      {toggleChips.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          onClick={() => handleToggleClick(selected, setSelected, i)}
          key={c}
        >
          {c}
        </Chips.Toggle>
      ))}
    </Chips>
  );
};

export const ToggleNoCheckmark = () => {
  const [selected, setSelected] = useState<number[]>([2]);
  return (
    <Chips>
      {toggleChips.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          checkmark={false}
          onClick={() => handleToggleClick(selected, setSelected, i)}
          key={c}
        >
          {c}
        </Chips.Toggle>
      ))}
    </Chips>
  );
};

export const ToggleWithDisabled = () => {
  const [selected, setSelected] = useState<number[]>([]);
  return (
    <Chips>
      {toggleChips.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          checkmark={false}
          disabled={i === 2}
          key={c}
          onClick={() => handleToggleClick(selected, setSelected, i)}
        >
          {c}
        </Chips.Toggle>
      ))}
    </Chips>
  );
};

export const RemovableBorder = () => {
  const [options, setOptions] = useState(removableChips);
  return (
    <Chips>
      {options.map((c) => (
        <Chips.Removable
          key={c}
          onClick={() => handleRemovableClick(options, setOptions, c)}
          aria-label={`Slett ${c}`}
        >
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};

export const RemovableFilled = () => {
  const [options, setOptions] = useState(removableChips);
  return (
    <Chips>
      {options.map((c) => (
        <Chips.Removable
          filled
          key={c}
          onClick={() => handleRemovableClick(options, setOptions, c)}
        >
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};

export const RemovableTruncate = () => {
  const chipsLongText = [
    'Registrerte arbeidsledige blant innvandrere (avsluttet i Statistisk sentralbyrå)',
    'Byggekostnadsindeks for røyrleggjararbeid i kontor- og forretningsbygg',
    'Frivillighet, politisk deltakelse og tillit, levekårsundersøkelsen',
  ];
  const [options, setOptions] = useState(chipsLongText);
  return (
    <Chips>
      {options.map((c) => (
        <Chips.Removable
          key={c}
          onClick={() => handleRemovableClick(options, setOptions, c)}
          truncate
        >
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};
