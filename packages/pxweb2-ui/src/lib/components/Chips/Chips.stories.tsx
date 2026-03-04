import { useEffect, useRef } from 'react';
import { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from 'storybook/preview-api';

import { Chips } from './Chips';

const meta = {
  title: 'Components/Chips',
  component: Chips,
} satisfies Meta<typeof Chips>;
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
  chips?: string[];
  disabledChipIds?: number[];
  selectedChipIds?: number[];
}

type Story = StoryObj<StoryProps>;

const handleToggleClick = (
  selectedChipIds: number[],
  chipIndexToToggle: number,
) =>
  selectedChipIds.includes(chipIndexToToggle)
    ? selectedChipIds.filter(
        (selectedChipId) => selectedChipId !== chipIndexToToggle,
      )
    : [...selectedChipIds, chipIndexToToggle];

const handleRemovableClick = (
  chipOptions: string[],
  chipLabelToRemove: string,
) => chipOptions.filter((chipLabel) => chipLabel !== chipLabelToRemove);

const hiddenInteractiveArgTypes = {
  chips: {
    table: { disable: true },
  },
  disabledChipIds: {
    table: { disable: true },
  },
  selectedChipIds: {
    table: { disable: true },
  },
};

export const Default = {
  argTypes: {
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
    ...hiddenInteractiveArgTypes,
  },
  args: {
    type: 'toggle',
    checkmark: true,
    filled: false,
    truncate: false,
    chips: toggleChips,
    selectedChipIds: [1, 2],
  },
  render: function Render(args) {
    const [{ type, chips = [], selectedChipIds = [] }, updateArgs] =
      useArgs<StoryProps>();
    const previousType = useRef(type);

    useEffect(() => {
      if (previousType.current !== type) {
        previousType.current = type;
        updateArgs({
          chips: type === 'toggle' ? [...toggleChips] : [...removableChips],
          selectedChipIds: [],
        });
      }
    }, [type, updateArgs]);

    if (type === 'toggle') {
      return (
        <Chips>
          {chips.map((chipLabel, chipIndex) => (
            <Chips.Toggle
              selected={selectedChipIds.includes(chipIndex)}
              checkmark={args.checkmark}
              key={chipLabel}
              onClick={() =>
                updateArgs({
                  selectedChipIds: handleToggleClick(
                    selectedChipIds,
                    chipIndex,
                  ),
                })
              }
            >
              {chipLabel}
            </Chips.Toggle>
          ))}
        </Chips>
      );
    }

    return (
      <Chips>
        {chips.map((chipLabel) => (
          <Chips.Removable
            filled={args.filled}
            key={chipLabel}
            onClick={() =>
              updateArgs({
                chips: handleRemovableClick(chips, chipLabel),
              })
            }
            truncate={args.truncate}
          >
            {chipLabel}
          </Chips.Removable>
        ))}
      </Chips>
    );
  },
} satisfies Story;

export const ToggleCheckmark = {
  args: {
    chips: toggleChips,
    selectedChipIds: [2, 4],
    checkmark: true,
  },
  argTypes: hiddenInteractiveArgTypes,
  render: function Render(args) {
    const [{ chips = [], selectedChipIds = [] }, updateArgs] =
      useArgs<StoryProps>();

    return (
      <Chips>
        {chips.map((chipLabel, chipIndex) => (
          <Chips.Toggle
            selected={selectedChipIds.includes(chipIndex)}
            onClick={() =>
              updateArgs({
                selectedChipIds: handleToggleClick(selectedChipIds, chipIndex),
              })
            }
            checkmark={args.checkmark}
            key={chipLabel}
          >
            {chipLabel}
          </Chips.Toggle>
        ))}
      </Chips>
    );
  },
} satisfies Story;

export const ToggleNoCheckmark = {
  args: {
    chips: toggleChips,
    selectedChipIds: [2],
    checkmark: false,
  },
  argTypes: hiddenInteractiveArgTypes,
  render: function Render(args) {
    const [{ chips = [], selectedChipIds = [] }, updateArgs] =
      useArgs<StoryProps>();

    return (
      <Chips>
        {chips.map((chipLabel, chipIndex) => (
          <Chips.Toggle
            selected={selectedChipIds.includes(chipIndex)}
            checkmark={args.checkmark}
            onClick={() =>
              updateArgs({
                selectedChipIds: handleToggleClick(selectedChipIds, chipIndex),
              })
            }
            key={chipLabel}
          >
            {chipLabel}
          </Chips.Toggle>
        ))}
      </Chips>
    );
  },
} satisfies Story;

export const ToggleWithDisabled = {
  args: {
    chips: toggleChips,
    selectedChipIds: [],
    checkmark: false,
    disabledChipIds: [2],
  },
  argTypes: hiddenInteractiveArgTypes,
  render: function Render(args) {
    const [
      { chips = [], selectedChipIds = [], disabledChipIds = [] },
      updateArgs,
    ] = useArgs<StoryProps>();

    return (
      <Chips>
        {chips.map((chipLabel, chipIndex) => (
          <Chips.Toggle
            selected={selectedChipIds.includes(chipIndex)}
            checkmark={args.checkmark}
            disabled={disabledChipIds.includes(chipIndex)}
            key={chipLabel}
            onClick={() =>
              updateArgs({
                selectedChipIds: handleToggleClick(selectedChipIds, chipIndex),
              })
            }
          >
            {chipLabel}
          </Chips.Toggle>
        ))}
      </Chips>
    );
  },
} satisfies Story;

export const RemovableBorder = {
  args: {
    chips: removableChips,
  },
  argTypes: hiddenInteractiveArgTypes,
  render: function Render() {
    const [{ chips = [] }, updateArgs] = useArgs<StoryProps>();

    return (
      <Chips>
        {chips.map((chipLabel) => (
          <Chips.Removable
            key={chipLabel}
            onClick={() =>
              updateArgs({
                chips: handleRemovableClick(chips, chipLabel),
              })
            }
            aria-label={`Slett ${chipLabel}`}
          >
            {chipLabel}
          </Chips.Removable>
        ))}
      </Chips>
    );
  },
} satisfies Story;

export const RemovableFilled = {
  args: {
    chips: removableChips,
    filled: true,
  },
  argTypes: hiddenInteractiveArgTypes,
  render: function Render(args) {
    const [{ chips = [] }, updateArgs] = useArgs<StoryProps>();

    return (
      <Chips>
        {chips.map((chipLabel) => (
          <Chips.Removable
            filled={args.filled}
            key={chipLabel}
            onClick={() =>
              updateArgs({
                chips: handleRemovableClick(chips, chipLabel),
              })
            }
          >
            {chipLabel}
          </Chips.Removable>
        ))}
      </Chips>
    );
  },
} satisfies Story;

export const RemovableTruncate = {
  args: {
    chips: [
      'Registrerte arbeidsledige blant innvandrere (avsluttet i Statistisk sentralbyrå)',
      'Byggekostnadsindeks for røyrleggjararbeid i kontor- og forretningsbygg',
      'Frivillighet, politisk deltakelse og tillit, levekårsundersøkelsen',
    ],
    truncate: true,
  },
  argTypes: hiddenInteractiveArgTypes,
  render: function Render(args) {
    const [{ chips = [] }, updateArgs] = useArgs<StoryProps>();

    return (
      <Chips>
        {chips.map((chipLabel) => (
          <Chips.Removable
            key={chipLabel}
            onClick={() =>
              updateArgs({
                chips: handleRemovableClick(chips, chipLabel),
              })
            }
            truncate={args.truncate}
          >
            {chipLabel}
          </Chips.Removable>
        ))}
      </Chips>
    );
  },
} satisfies Story;
