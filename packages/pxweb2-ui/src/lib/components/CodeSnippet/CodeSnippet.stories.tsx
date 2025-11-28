import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeSnippet } from './CodeSnippet';

const jsonExample = `{
  "query": [
    {
      "code": "region"
    }
}`;
const jsonExampleLong = `{
  "query": [
    {
      "code": "region",
      "selection": {
        "filter": "item",
        "values": ["0301", "0402", "0180", "0192"]
      }
    },
    {
      "code": "year",
      "selection": {
        "filter": "item",
        "values": ["2025"]
      }
    }
  ],
  "response": {
    "format": "json-stat2"
  }
}`;

const meta = {
  title: 'Components/CodeSnippet',
  component: CodeSnippet,
  args: {
    title: 'Example JSON Snippet',
    children: jsonExample,
    translations: {
      copyButtonLabel: 'Copy code',
      copiedButtonLabel: 'Code copied',
    },
  },
} satisfies Meta<typeof CodeSnippet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const ShortCodeExample: Story = {};
export const LongCodeExample: Story = {
  args: {
    children: jsonExampleLong,
  },
};
