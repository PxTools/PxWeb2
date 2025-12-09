import type { Meta, StoryObj } from '@storybook/react-vite';
import { t } from 'i18next';

import { CodeSnippet } from './CodeSnippet';

const NoHighlightExampleChildren = `https://api.example.com/data?region=0301&year=2025`;
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
    title: 'No Highlight Example',
    children: NoHighlightExampleChildren,
    translations: {
      copyButtonLabel: t('common.code_snippet.copy_button_label'),
      copiedButtonLabel: t('common.code_snippet.copied_button_label'),
    },
  },
} satisfies Meta<typeof CodeSnippet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const NoHighlightExample: Story = {};
export const ShortCodeExample: Story = {
  args: {
    title: 'Example JSON Snippet',
    children: jsonExample,
    highlight: 'json',
  },
};
export const LongCodeExample: Story = {
  args: {
    title: 'Example JSON Snippet',
    children: jsonExampleLong,
    highlight: 'json',
  },
};
export const TwoCodeSnippets: Story = {
  render: (args) => (
    <>
      <CodeSnippet {...args} />
      <CodeSnippet
        {...args}
        title="Second Code Snippet"
        children={jsonExampleLong}
        highlight="json"
      />
    </>
  ),
};
