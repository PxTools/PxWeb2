import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const colors = ['neutral', 'info', 'success', 'warning', 'error'] as const;
const sizes = ['medium', 'large'] as const;
const variants = ['default', 'subtle'] as const;
const meta = {
  component: Badge,
  title: 'Components/Badge',
  tags: ['autodocs'],
  args: {
    variant: 'default',
    color: 'neutral',
    size: 'medium',
    label: '9',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'subtle'] },
    color: {
      control: 'inline-radio',
      options: ['neutral', 'info', 'success', 'warning', 'error'],
    },
    size: { control: 'inline-radio', options: ['medium', 'large'] },
    label: { control: 'text' },
  },
} satisfies Meta<typeof Badge>;
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
  minWidth: '120px',
  fontWeight: 600,
} as const;

type Story = StoryObj<typeof meta>;
type BadgeProps = ComponentProps<typeof Badge>;
type BadgeRow = { labelText: string; badge: BadgeProps };

function renderBadgeRows(args: BadgeProps, rows: BadgeRow[]) {
  return (
    <div style={wrapperStyle}>
      {rows.map(({ labelText, badge }) => (
        <div key={labelText} style={rowStyle}>
          <span style={labelStyle}>{labelText}</span>
          <Badge {...args} {...badge} />
        </div>
      ))}
    </div>
  );
}

function renderColorRow(
  args: BadgeProps,
  keyPrefix: string,
  badge: BadgeProps,
) {
  return (
    <div style={rowStyle}>
      {colors.map((color) => (
        <Badge
          key={`${keyPrefix}-${color}`}
          {...args}
          {...badge}
          color={color}
        />
      ))}
    </div>
  );
}

export const Playground: Story = {};

export const SizeAndLabelStates: Story = {
  render: (args) =>
    renderBadgeRows(args, [
      { labelText: 'Medium with label', badge: { size: 'medium', label: '9' } },
      { labelText: 'Large with label', badge: { size: 'large', label: '99' } },
      {
        labelText: 'Medium without label',
        badge: { size: 'medium', label: '' },
      },
      { labelText: 'Large without label', badge: { size: 'large', label: '' } },
    ]),
};

export const ColorsByVariant: Story = {
  args: { label: '9', size: 'medium' },
  argTypes: {
    variant: { control: false },
    color: { control: false },
  },
  render: (args) => (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        <span style={labelStyle}>Default (with label)</span>
        {renderColorRow(args, 'default-labeled', { variant: 'default' })}
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Default (without label)</span>
        {renderColorRow(args, 'default-unlabeled', {
          variant: 'default',
          label: '',
        })}
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Subtle (with label)</span>
        {renderColorRow(args, 'subtle-labeled', { variant: 'subtle' })}
      </div>
      <div style={rowStyle}>
        <span style={labelStyle}>Subtle (without label)</span>
        {renderColorRow(args, 'subtle-unlabeled', {
          variant: 'subtle',
          label: '',
        })}
      </div>
    </div>
  ),
};

export const AllCombinations: Story = {
  args: { label: '9' },
  argTypes: {
    variant: { control: false },
    color: { control: false },
    size: { control: false },
    label: { control: false },
  },
  render: (args) => (
    <div style={wrapperStyle}>
      {variants.map((variant) =>
        sizes.map((size) => (
          <div key={`${variant}-${size}`} style={rowStyle}>
            <span style={labelStyle}>{`${variant} / ${size}`}</span>

            {/* With label */}
            {renderColorRow(args, `${variant}-${size}-labeled`, {
              variant,
              size,
            })}

            {/* Without label */}
            {renderColorRow(args, `${variant}-${size}-unlabeled`, {
              variant,
              size,
              label: '',
            })}
          </div>
        )),
      )}
    </div>
  ),
};

export default meta;
