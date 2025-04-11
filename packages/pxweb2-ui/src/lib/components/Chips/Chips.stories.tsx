import { Meta } from '@storybook/react';
import { useState } from 'react';

import { Chips } from './Chips';

const meta: Meta<typeof Chips> = {
  title: 'Components/Chips',
  component: Chips,
};
export default meta;

const options = ['Norsk', 'Dansk', 'Svensk', 'Tysk', 'Spansk'];

interface StoryProps {
  type?: 'toggle' | 'removable';
  variant?: 'border' | 'filled';
  checkmark?: boolean;
}

export const Default = (props: StoryProps) => {
  const [selected, setSelected] = useState(['Dansk', 'Svensk']);
  const [filter, setFilter] = useState(options);

  if (props.type === 'toggle') {
    return (
      <Chips>
        {options.map((c) => (
          <Chips.Toggle
            selected={selected.includes(c)}
            checkmark={props.checkmark}
            key={c}
            onClick={() =>
              setSelected(
                selected.includes(c)
                  ? selected.filter((x) => x !== c)
                  : [...selected, c],
              )
            }
          >
            {c}
          </Chips.Toggle>
        ))}
      </Chips>
    );
  }

  return (
    <Chips>
      {filter.map((c) => (
        <Chips.Removable
          variant={props.variant}
          key={c}
          onClick={() => setFilter((x) => x.filter((y) => y !== c))}
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

export const Toggle = () => {
  const [selected, setSelected] = useState<number[]>([2, 4]);
  return (
    <Chips>
      {options.map((c, i) => (
        <Chips.Toggle
          selected={selected.includes(i)}
          onClick={() =>
            setSelected(
              selected.includes(i)
                ? selected.filter((x) => x !== i)
                : [...selected, i],
            )
          }
          key={i}
        >
          {c}
        </Chips.Toggle>
      ))}
    </Chips>
  );
};

export const ToggleNoCheckmark = () => {
  const [selected, setSelected] = useState<number>(2);
  return (
    <Chips>
      {options.map((c, i) => (
        <Chips.Toggle
          selected={selected === i}
          checkmark={false}
          onClick={() => setSelected(i)}
          key={i}
        >
          {c}
        </Chips.Toggle>
      ))}
    </Chips>
  );
};

export const Removable = () => {
  return (
    <Chips>
      {options.map((c, i) => (
        <Chips.Removable key={i}>{c}</Chips.Removable>
      ))}
    </Chips>
  );
};

export const RemovableFilled = () => {
  return (
    <Chips>
      {options.map((c, i) => (
        <Chips.Removable variant="filled" key={i}>
          {c}
        </Chips.Removable>
      ))}
    </Chips>
  );
};

export const SingleChip = () => {
  return <Chips.Removable variant="filled">Test</Chips.Removable>;
};
