import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from './Badge';

const colors = ['neutral', 'info', 'success', 'warning', 'error'] as const;
const sizes = ['medium', 'large'] as const;
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

function renderBadgeRow(
  args: BadgeProps,
  overrides: Array<{ labelText: string; badge: BadgeProps }>,
) {
  return (
    <div style={wrapperStyle}>
      {overrides.map(({ labelText, badge }) => (
        <div key={labelText} style={rowStyle}>
          <span style={labelStyle}>{labelText}</span>
          <Badge {...args} {...badge} />
        </div>
      ))}
    </div>
  );
}

export const Playground: Story = {};

export const SizeAndLabelStates: Story = {
  render: (args) =>
    renderBadgeRow(args, [
      { labelText: 'Medium with label', badge: { size: 'medium', label: '9' } },
      { labelText: 'Large with label', badge: { size: 'large', label: '99' } },
      {
        labelText: 'Medium without label',
        badge: { size: 'medium', label: '' },
      },
      { labelText: 'Large without label', badge: { size: 'large', label: '' } },
    ]),
};

export const DefaultColors: Story = {
  args: { variant: 'default', label: '9', size: 'medium' },
  render: (args) => (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        {colors.map((color) => (
          <Badge key={`default-labeled-${color}`} {...args} color={color} />
        ))}
      </div>
      <div style={rowStyle}>
        {colors.map((color) => (
          <Badge
            key={`default-unlabeled-${color}`}
            {...args}
            color={color}
            label=""
          />
        ))}
      </div>
    </div>
  ),
};

export const SubtleColors: Story = {
  args: { variant: 'subtle', label: '9', size: 'medium' },
  render: (args) => (
    <div style={wrapperStyle}>
      <div style={rowStyle}>
        {colors.map((color) => (
          <Badge key={`subtle-labeled-${color}`} {...args} color={color} />
        ))}
      </div>
      <div style={rowStyle}>
        {colors.map((color) => (
          <Badge
            key={`subtle-unlabeled-${color}`}
            {...args}
            color={color}
            label=""
          />
        ))}
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
      {(['default', 'subtle'] as const).map((variant) =>
        sizes.map((size) => (
          <div key={`${variant}-${size}`} style={rowStyle}>
            <span style={labelStyle}>{`${variant} / ${size}`}</span>

            {colors.map((color) => (
              <Badge
                key={`${variant}-${size}-${color}`}
                {...args}
                variant={variant}
                size={size}
                color={color}
              />
            ))}

            {colors.map((color) => (
              <Badge
                key={`${variant}-${size}-${color}`}
                variant={variant}
                size={size}
                color={color}
              />
            ))}
          </div>
        )),
      )}
    </div>
  ),
};

export default meta;
