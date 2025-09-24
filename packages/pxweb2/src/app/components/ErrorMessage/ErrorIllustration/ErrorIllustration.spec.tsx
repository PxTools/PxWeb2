import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ErrorIllustration } from './ErrorIllustration';

describe('ErrorIllustration', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {
      // Mock implementation
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders with valid illustration and background combination', () => {
    const { container, getAllByRole } = render(
      <ErrorIllustration
        backgroundShape="circle"
        illustrationName="NotFound"
      />,
    );
    const svgElements = getAllByRole('presentation');

    expect(svgElements).toHaveLength(2);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with different valid combinations', () => {
    const { getAllByRole } = render(
      <ErrorIllustration
        backgroundShape="wavy"
        illustrationName="GenericError"
      />,
    );
    const svgElements = getAllByRole('presentation');

    expect(svgElements).toHaveLength(2);
  });

  it('returns null and logs error when illustration is not found', () => {
    const invalidProps = {
      backgroundShape: 'circle',
      illustrationName: 'InvalidIllustration',
    };
    const { container } = render(
      <ErrorIllustration
        {...(invalidProps as Parameters<typeof ErrorIllustration>[0])}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(console.log).toHaveBeenCalledWith(
      'ErrorIllustration: Illustration InvalidIllustration not found',
    );
  });

  it('returns null and logs error when background shape is not found', () => {
    const invalidProps = {
      backgroundShape: 'invalidShape',
      illustrationName: 'NotFound',
    };
    const { container } = render(
      <ErrorIllustration
        {...(invalidProps as Parameters<typeof ErrorIllustration>[0])}
      />,
    );

    expect(container.firstChild).toBeNull();
    expect(console.log).toHaveBeenCalledWith(
      'ErrorIllustration: Background shape "invalidShape" for illustration NotFound not found',
    );
  });
});
