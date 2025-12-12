import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import GlobalAlert, { GlobalAlertProps } from './GlobalAlert';

describe('GlobalAlert', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<GlobalAlert variant="info" />);
    expect(baseElement).toBeTruthy();
  });
});
it.each([
  ['polite', 'info'],
  ['polite', 'success'],
  ['assertive', 'warning'],
  ['assertive', 'error'],
])(
  'should set aria-live="%s" for variant "%s"',
  (expectedAriaLive, variant) => {
    const headingText = `Test heading for ${variant}`;
    const { getByText } = render(
      <GlobalAlert
        variant={variant as GlobalAlertProps['variant']}
        heading={headingText}
      />,
    );
    const heading = getByText(headingText);
    const headingContainer = heading.closest('div[aria-live]');
    expect(headingContainer).not.toBeNull();
    expect(headingContainer).toHaveAttribute('aria-live', expectedAriaLive);
  },
);
