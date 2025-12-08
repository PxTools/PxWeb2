import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Search } from './Search';

const meta: Meta<typeof Search> = {
  component: Search,
  title: 'Components/Search',
  argTypes: {
    value: { control: 'text', description: 'Current search value' },
    variant: {
      control: 'radio',
      options: ['default', 'inVariableBox'],
      description: 'Visual style variant',
    },
    labelText: { control: 'text', description: 'Text for the label' },
    searchPlaceHolder: {
      control: 'text',
      description: 'Placeholder text for the search field',
    },
    showLabel: { control: 'boolean', description: 'Whether to show the label' },
    variableBoxTopBorderOverride: {
      control: 'boolean',
      description: 'Override for border radius when used in a variableBox',
    },
    arialLabelClearButtonText: {
      control: 'text',
      description: 'Accessibility label for the clear button',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ margin: '3em' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'A search input component with clear functionality, keyboard support, and multiple styling variants.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Search>;

export const Default: Story = {
  args: {
    variant: 'default',
    searchPlaceHolder: 'Search...',
  },
};

export const WithLabel: Story = {
  args: {
    variant: 'default',
    searchPlaceHolder: 'Search...',
    showLabel: true,
    labelText: 'Search label',
  },
};

export const WithHiddenLabel: Story = {
  args: {
    variant: 'default',
    searchPlaceHolder: 'Search...',
    showLabel: false,
    labelText: 'Hidden search label',
  },
};

export const InVariableBox: Story = {
  args: {
    variant: 'inVariableBox',
    searchPlaceHolder: 'Search in list...',
  },
};

export const InVariableBoxWithBorderOverride: Story = {
  args: {
    variant: 'inVariableBox',
    searchPlaceHolder: 'Search in list...',
    variableBoxTopBorderOverride: true,
  },
};

// Interactive example showing onChange handling and clear button
export const Interactive = () => {
  const [searchValue, setSearchValue] = useState('');
  return (
    <div style={{ maxWidth: '300px' }}>
      <h3>Interactive Search Example</h3>
      <p>Current value: "{searchValue}"</p>
      <Search
        value={searchValue}
        onChange={setSearchValue}
        searchPlaceHolder="Type to see clear button..."
      />
      <div style={{ marginTop: '10px' }}>
        <small>
          Try typing text to see the clear button appear, then click it or press
          Escape to clear
        </small>
      </div>
    </div>
  );
};

// Show all variants in one view
export const AllVariants = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Default</h3>
        <Search searchPlaceHolder="Default search..." />
      </div>

      <div>
        <h3>Default with Label</h3>
        <Search
          searchPlaceHolder="Search with label..."
          showLabel={true}
          labelText="Search label"
        />
      </div>

      <div>
        <h3>In Variable Box</h3>
        <Search
          variant="inVariableBox"
          searchPlaceHolder="Variable box search..."
        />
      </div>

      <div>
        <h3>In Variable Box with Border Override</h3>
        <Search
          variant="inVariableBox"
          variableBoxTopBorderOverride={true}
          searchPlaceHolder="With border override..."
        />
      </div>

      <div>
        <h3>With Initial Value</h3>
        <Search
          value="Initial text value"
          searchPlaceHolder="This has initial value..."
        />
      </div>
    </div>
  );
};
