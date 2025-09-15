import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { GenericErrorTableViewer } from './GenericErrorTableViewer';

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
    const { container } = render(<GenericErrorTableViewer />);

    expect(container.firstChild).toBeTruthy();
  });

  it('should render the error layout', () => {
    const { getByTestId } = render(<GenericErrorTableViewer />);

    expect(getByTestId('error-layout')).toBeInTheDocument();
  });

  it('should render the error message', () => {
    const { getByTestId } = render(<GenericErrorTableViewer />);

    expect(getByTestId('error-message')).toBeInTheDocument();
  });
});
