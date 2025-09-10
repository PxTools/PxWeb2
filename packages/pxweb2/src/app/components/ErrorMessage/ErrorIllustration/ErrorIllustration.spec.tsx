import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorIllustration } from './ErrorIllustration';

describe('ErrorIllustration', () => {
  it('renders the correct illustration for each error type', () => {
    const { getByRole } = render(
      <ErrorIllustration
        backgroundShape="circle"
        illustrationName="NotFound"
      />,
    );

    expect(getByRole('presentation')).toBeInTheDocument();
  });
});
