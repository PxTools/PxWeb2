import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render successfully', () => {
    const { container } = render(
      <ErrorMessage
        action="button"
        align="center"
        size="large"
        statusCode={500}
        title="Test error title"
        description="Test error description"
        actionText="Retry"
      />,
    );

    expect(container.firstChild).toBeTruthy();
  });
});
