import { Meta } from '@storybook/react';
import { useState } from 'react';

import { Chips } from './Chips';

const meta: Meta<typeof Chips> = {
  title: 'Components/Chips',
  component: Chips,
};
export default meta;

const chips = ['Norsk', 'Dansk', 'Svensk', 'Tysk', 'Spansk'];

interface StoryProps {
  type?: 'toggle' | 'removable';
  variant?: 'border' | 'filled';
  checkmark?: boolean;
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
  const [options, setOptions] = useState(chips);

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
          variant={props.variant}
          key={c}
          onClick={() => handleRemovableClick(options, setOptions, c)}
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
  variant: {
    control: { type: 'radio' },
    options: ['border', 'filled'],
    if: { arg: 'type', eq: 'removable' },
  },
};

export const ToggleCheckmark = () => {
  const [selected, setSelected] = useState<number[]>([2, 4]);
  return (
    <Chips>
      {chips.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          onClick={() => handleToggleClick(selected, setSelected, i)}
          key={i}
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
      {chips.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          checkmark={false}
          onClick={() => handleToggleClick(selected, setSelected, i)}
          key={i}
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
      {chips.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          checkmark={false}
          disabled={i === 4}
          key={i}
          onClick={() => handleToggleClick(selected, setSelected, i)}
        >
          {c}
        </Chips.Toggle>
      ))}
    </Chips>
  );
};

export const RemovableBorder = () => {
  const [options, setOptions] = useState(chips);
  return (
    <Chips>
      {options.map((c, i) => (
        <Chips.Removable
          key={i}
          onClick={() => handleRemovableClick(options, setOptions, c)}
        >
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};

export const RemovableFilled = () => {
  const [options, setOptions] = useState(chips);
  return (
    <Chips>
      {options.map((c, i) => (
        <Chips.Removable
          variant="filled"
          key={i}
          onClick={() => handleRemovableClick(options, setOptions, c)}
        >
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};
