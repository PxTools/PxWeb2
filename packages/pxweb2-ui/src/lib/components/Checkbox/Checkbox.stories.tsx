import type { Meta, StoryFn } from '@storybook/react-vite';
import React from 'react';

import { Checkbox, MixedCheckbox } from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Components/Checkbox',
};
export default meta;

export const MixedStateCheckbox: StoryFn<typeof Checkbox> = () => {
  const [selectedMalamute, setSelectedMalamute] = React.useState(true);
  const [selectedHusky, setSelectedHusky] = React.useState(true);
  const [selectedYorkshireTerrier, setSelectedYorkshireTerrier] =
    React.useState(false);
  const [allSelected, setAllSelected] = React.useState<
    'mixed' | 'true' | 'false'
  >('mixed');

  React.useEffect(() => {
    if (!selectedHusky && !selectedMalamute && !selectedYorkshireTerrier) {
      setAllSelected('false');
    } else if (selectedHusky && selectedMalamute && selectedYorkshireTerrier) {
      setAllSelected('true');
    } else {
      setAllSelected('mixed');
    }
  }, [selectedMalamute, selectedHusky, selectedYorkshireTerrier]);

  return (
    <>
      <MixedCheckbox
        id="test"
        text="Select all"
        onChange={() => {
          if (selectedHusky && selectedMalamute && selectedYorkshireTerrier) {
            setSelectedHusky(false);
            setSelectedMalamute(false);
            setSelectedYorkshireTerrier(false);
          }
          if (
            !selectedHusky ||
            !selectedMalamute ||
            !selectedYorkshireTerrier
          ) {
            setSelectedHusky(true);
            setSelectedMalamute(true);
            setSelectedYorkshireTerrier(true);
          }
        }}
        ariaControls={['var1', 'var2', 'var3']}
        value={allSelected}
        strong={true}
      />

      <Checkbox
        id="var1"
        text="Husky"
        onChange={(val) => {
          setSelectedHusky(val);
        }}
        value={selectedHusky}
      />
      <Checkbox
        id="var2"
        text="Malamute"
        onChange={(val) => {
          setSelectedMalamute(val);
        }}
        value={selectedMalamute}
      />
      <Checkbox
        id="var3"
        text="Yorkshire Terrier"
        onChange={(val) => {
          setSelectedYorkshireTerrier(val);
        }}
        value={selectedYorkshireTerrier}
      />
    </>
  );
};

export const LongTextOn400pxWideMax: StoryFn<typeof Checkbox> = () => {
  const [selectedVar1, setSelectedVar1] = React.useState(true);
  const [selectedVar2, setSelectedVar2] = React.useState(true);
  const [selectedVar3, setSelectedVar3] = React.useState(false);

  return (
    <div style={{ width: '400px' }}>
      <p>
        An example of how labeltext wraps on multiple lines in smaller spaces
      </p>
      <Checkbox
        id="var1"
        text="The text on this checkbox spans multiple lines. That's why it is written so long. Here's an additional sentence."
        onChange={(val) => {
          setSelectedVar2(val);
        }}
        value={selectedVar2}
      />

      <Checkbox
        id="var2"
        text="Short text"
        onChange={(val) => {
          setSelectedVar1(val);
        }}
        value={selectedVar1}
      />
      <Checkbox
        id="var3"
        text="The text on this checkbox spans multiple lines. That's why it is written so long. Here's an additional sentence."
        onChange={(val) => {
          setSelectedVar3(val);
        }}
        value={selectedVar3}
      />
    </div>
  );
};
export const NoMargin: StoryFn<typeof Checkbox> = () => {
  const [selectedVar1, setSelectedVar1] = React.useState(true);
  const [selectedVar2, setSelectedVar2] = React.useState(true);
  const [selectedVar3, setSelectedVar3] = React.useState(false);

  return (
    <div style={{ width: '400px' }}>
      <Checkbox
        id="var1"
        text="No margin"
        onChange={(val) => {
          setSelectedVar2(val);
        }}
        value={selectedVar2}
        noMargin={true}
      />

      <Checkbox
        id="var2"
        text="No margin"
        onChange={(val) => {
          setSelectedVar1(val);
        }}
        value={selectedVar1}
        noMargin={true}
      />
      <Checkbox
        id="var3"
        text="Margin"
        onChange={(val) => {
          setSelectedVar3(val);
        }}
        value={selectedVar3}
        noMargin={false}
      />
    </div>
  );
};

export const WithSubtle: StoryFn<typeof Checkbox> = () => {
  const [selectedVar1, setSelectedVar1] = React.useState(true);
  const [selectedVar2, setSelectedVar2] = React.useState(false);
  const [selectedVar3, setSelectedVar3] = React.useState(false);

  return (
    <div style={{ width: '400px' }}>
      <Checkbox
        id="var1"
        text="Checkbox 1"
        onChange={(val) => {
          setSelectedVar2(val);
        }}
        value={selectedVar2}
      />

      <Checkbox
        id="var2"
        text="Checkbox 2"
        onChange={(val) => {
          setSelectedVar1(val);
        }}
        value={selectedVar1}
      />
      <Checkbox
        id="var3"
        text="Subtle checkbox 1"
        onChange={(val) => {
          setSelectedVar3(val);
        }}
        value={selectedVar3}
        subtle
      />
    </div>
  );
};
