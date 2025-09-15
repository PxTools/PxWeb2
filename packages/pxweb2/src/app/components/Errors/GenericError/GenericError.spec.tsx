import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { GenericError } from './GenericError';

// Mock the internal components
vi.mock('../ErrorLayout', () => ({
  ErrorLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-layout">{children}</div>
  ),
}));
vi.mock('../../ErrorMessage', () => ({
  ErrorMessage: () => <div data-testid="error-message">ErrorMessage</div>,
}));

describe('GenericErrorTableViewer', () => {
  it('should render successfully', () => {
    const { container } = render(<GenericError />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the error layout', () => {
    const { getByTestId } = render(<GenericError />);

    expect(getByTestId('error-layout')).toBeInTheDocument();
  });

  it('should render the error message', () => {
    const { getByTestId } = render(<GenericError />);

    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
