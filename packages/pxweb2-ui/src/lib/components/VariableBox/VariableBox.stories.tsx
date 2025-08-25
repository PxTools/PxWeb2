import type { Meta, StoryObj } from '@storybook/react-vite';

import { VariableBox, VariableBoxProps, SelectedVBValues } from './VariableBox';
import { SelectOption } from '../Select/SelectOptionType';
import { Value } from '../../shared-types/value';
import { VartypeEnum } from '../../shared-types/vartypeEnum';
import { CodeList } from '../../shared-types/codelist';

const meta = {
  title: 'Components/VariableBox',
  component: VariableBox,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '3em',
          width: '100%',
          minWidth: '450px',
          backgroundColor: 'var(--px-color-background-subtle)',
        }}
      >
        {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof VariableBox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for the stories - adding label property to match expected structure
const mockValues = [
  { code: '01', label: 'Oslo' },
  { code: '02', label: 'Akershus' },
  { code: '03', label: 'Østfold' },
  { code: '04', label: 'Hedmark' },
  { code: '05', label: 'Oppland' },
];

const mockCodeLists: CodeList[] = [
  { id: 'list1', label: 'Main regions', values: mockValues },
  { id: 'list2', label: 'Counties', values: [] },
];

const mockSelectedValues: SelectedVBValues[] = [
  {
    id: 'region',
    selectedCodeList: 'list1',
    values: ['01', '03'],
  },
];

// Common props for all stories
const commonProps = {
  id: 'region',
  label: 'region',
  tableId: '12345',
  mandatory: false,
  languageDirection: 'ltr' as const,
  type: VartypeEnum.CONTENTS_VARIABLE,
  values: mockValues,
  codeLists: mockCodeLists,
  onChangeCodeList: (selectedItem: SelectOption | undefined, varId: string) => {
    console.log('CodeList changed:', selectedItem, 'for variable:', varId);
  },
  onChangeCheckbox: (varId: string, value: string) => {
    console.log('Checkbox changed for variable:', varId, 'value:', value);
  },
  onChangeMixedCheckbox: (
    varId: string,
    allValuesSelected: string,
    searchValues: Value[],
  ) => {
    console.log('Mixed checkbox changed:', {
      varId,
      allValuesSelected,
      searchValues,
    });
  },
  addModal: (name: string) => {
    console.log('Add modal:', name);
  },
  removeModal: (name: string) => {
    console.log('Remove modal:', name);
  },
};

export const Default: Story = {
  args: {
    ...commonProps,
    selectedValues: mockSelectedValues,
    initialIsOpen: true,
  } satisfies VariableBoxProps,
};

export const Closed: Story = {
  args: {
    ...commonProps,
    selectedValues: mockSelectedValues,
    initialIsOpen: false,
  },
};

export const Mandatory: Story = {
  args: {
    ...commonProps,
    mandatory: true,
    selectedValues: mockSelectedValues,
  },
};

export const MandatoryWithError: Story = {
  args: {
    ...commonProps,
    mandatory: true,
    selectedValues: [
      {
        id: 'region',
        selectedCodeList: undefined,
        values: [],
      },
    ],
  },
};

export const AllValuesSelected: Story = {
  args: {
    ...commonProps,
    selectedValues: [
      {
        id: 'region',
        selectedCodeList: 'list1',
        values: mockValues.map((v) => v.code),
      },
    ],
  },
};

export const NoValuesSelected: Story = {
  args: {
    ...commonProps,
    selectedValues: [
      {
        id: 'region',
        selectedCodeList: 'list1',
        values: [],
      },
    ],
  },
};

export const LongVariableName: Story = {
  args: {
    ...commonProps,
    label:
      'This is a very long variable name that should wrap properly in the component',
    selectedValues: mockSelectedValues,
  },
};

export const ManyValues: Story = {
  args: {
    ...commonProps,
    values: Array.from({ length: 50 }, (_, i) => ({
      code: String(i + 1).padStart(4, '0'),
      name: `Municipality ${i + 1}`,
      label: `Municipality ${i + 1}`,
    })),
    selectedValues: [
      {
        id: 'region',
        selectedCodeList: 'list1',
        values: ['0001', '0010', '0025'],
      },
    ],
  },
};

/**
 * Story to demonstrate the component with RTL (right-to-left) language direction.
 * This is useful for languages like Arabic or Hebrew.
 *
 * IMPORTANT: The direction of the Grouping Chevron is not updated when changing language in Storybook!
 */
export const RTLDirection: Story = {
  args: {
    ...commonProps,
    initialIsOpen: true,
    languageDirection: 'rtl',
    selectedValues: mockSelectedValues,
  },
};
