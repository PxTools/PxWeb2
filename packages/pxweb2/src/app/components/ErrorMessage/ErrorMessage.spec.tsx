import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorMessage } from './ErrorMessage';

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

describe('ErrorMessage', () => {
  it('should render successfully', () => {
    const { container } = render(
      <ErrorMessage
        action="button"
        align="center"
        illustration="NotFound"
        title="Test error title"
        description="Test error description"
        actionText="Retry"
      />,
    );

    expect(container.firstChild).toBeTruthy();
  });
});
