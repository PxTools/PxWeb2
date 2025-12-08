import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { CheckCircleIcon } from './CheckCircleIcon';
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
