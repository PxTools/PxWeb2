import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';

import { CheckCircleIcon } from './CheckCircleIcon';
import { CheckCircleToggle } from './CheckCircleToggle';
import styles from './CheckCircle.module.scss';

describe('CheckCircleIcon', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CheckCircleIcon checked={false} />);
    expect(baseElement).toBeTruthy();
  });

  it('should render unchecked state with no SVG element', () => {
    const { baseElement } = render(<CheckCircleIcon checked={false} />);
    const iconWrapper = baseElement.querySelector('span');
    const svgElement = baseElement.querySelector('svg');
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper).not.toHaveClass(styles.checked);
    expect(svgElement).not.toBeInTheDocument();
  });

  it('should render checked state with an SVG element', () => {
    const { baseElement } = render(<CheckCircleIcon checked={true} />);
    const iconWrapper = baseElement.querySelector('span');
    const svgElement = baseElement.querySelector('svg');
    expect(iconWrapper).toBeInTheDocument();
    expect(iconWrapper).toHaveClass(styles.checked);
    expect(svgElement).toBeInTheDocument();
    expect(svgElement).toHaveClass(styles.iconChecked);
  });
});

describe('CheckCircleToggle', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <CheckCircleToggle checked={false} label="Test" />,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should render unchecked state correctly', () => {
    const { getByRole, getByText } = render(
      <CheckCircleToggle checked={false} label="Test Label" />,
    );
    const button = getByRole('switch');
    const label = getByText('Test Label');

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-checked', 'false');
    expect(label).toBeInTheDocument();
  });

  it('should render checked state correctly', () => {
    const { getByRole, getByText } = render(
      <CheckCircleToggle checked={true} label="Test Label" />,
    );
    const button = getByRole('switch');
    const label = getByText('Test Label');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-checked', 'true');
    expect(label).toBeInTheDocument();
  });

  it('should toggle aria-checked when clicked (controlled)', () => {
    const ToggleWithState = () => {
      const [checked, setChecked] = useState(false);
      return (
        <CheckCircleToggle
          checked={checked}
          label="Toggle"
          onChange={setChecked}
        />
      );
    };

    const { getByRole } = render(<ToggleWithState />);
    const button = getByRole('switch');

    expect(button).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-checked', 'false');
  });
});
