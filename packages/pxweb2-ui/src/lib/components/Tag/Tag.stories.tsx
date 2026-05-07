import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Tag } from './Tag';

const colors = [
  'subtle',
  'neutral',
  'info',
  'success',
  'warning',
  'error',
  'error-subtle',
] as const;
const sizes = ['medium', 'small', 'xsmall'] as const;
const variants = ['default', 'border'] as const;

const meta = {
  component: Tag,
  title: 'Components/Tag',
  tags: ['autodocs'],
  args: {
    size: 'medium',
    variant: 'default',
    color: 'neutral',
    children: 'Tag',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small', 'xsmall'] },
    variant: {
      control: 'inline-radio',
      options: ['default', 'border'],
    },
    color: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
    },
    children: { control: 'text' },
  },
} satisfies Meta<typeof Tag>;

const wrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
} as const;

const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  flexWrap: 'wrap',
} as const;

const labelStyle = {
  minWidth: '150px',
  fontWeight: 600,
} as const;

type Story = StoryObj<typeof meta>;
type TagProps = ComponentProps<typeof Tag>;
type TagRow = { labelText: string; tag: TagProps };

function renderTagRows(args: TagProps, rows: TagRow[]) {
  return (
    <div style={wrapperStyle}>
      {rows.map(({ labelText, tag }) => (
        <div key={labelText} style={rowStyle}>
          <span style={labelStyle}>{labelText}</span>
          <Tag {...args} {...tag} />
        </div>
      ))}
    </div>
  );
}

function renderColorRow(args: TagProps, keyPrefix: string, tag: TagProps) {
  return (
    <div style={rowStyle}>
      {colors.map((color) => (
        <Tag key={`${keyPrefix}-${color}`} {...args} {...tag} color={color}>
          {color}
        </Tag>
      ))}
    </div>
  );
}

export const Playground: Story = {};

export const SizeStates: Story = {
  render: (args) =>
    renderTagRows(args, [
      { labelText: 'Medium', tag: { size: 'medium' } },
      { labelText: 'Small', tag: { size: 'small' } },
      { labelText: 'Xsmall', tag: { size: 'xsmall' } },
    ]),
};

export const ColorsByVariant: Story = {
  args: { children: 'Tag', size: 'medium' },
  argTypes: {
    variant: { control: false },
    color: { control: false },
  },
  render: (args) => (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>Default</span>
        {renderColorRow(args, 'default', { variant: 'default' })}
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Border</span>
        {renderColorRow(args, 'border', { variant: 'border' })}
      </div>
    </div>
  ),
};

export const AllCombinations: Story = {
  args: { children: 'Tag' },
  argTypes: {
    variant: { control: false },
    color: { control: false },
    size: { control: false },
    children: { control: false },
  },
  render: (args) => (
    <div style={wrapperStyle}>
      {variants.map((variant) =>
        sizes.map((size) => (
          <div key={`${variant}-${size}`} style={rowStyle}>
            <span style={labelStyle}>{`${variant} / ${size}`}</span>
            {renderColorRow(args, `${variant}-${size}`, { variant, size })}
          </div>
        )),
      )}
    </div>
  ),
};

export default meta;
