import type { Meta, StoryFn } from '@storybook/react';
import { Checkbox, MixedCheckbox } from './Checkbox';
import React from 'react';

/* import { within } from '@storybook/testing-library';
import { expect } from '@storybook/jest'; */

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  title: 'Components/Checkbox',
};
export default meta;

export const Variants: StoryFn<typeof Checkbox> = () => {
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
        text="All dog breeds"
        onChange={(val) => {
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
