import { render, screen } from '@testing-library/react';
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
  });
});

describe('ErrorIllustration size handling', () => {
  it('defaults to medium when size not provided', () => {
    render(
      <ErrorIllustration
        backgroundShape="circle"
        illustrationName="NotFound"
      />,
    );
    const svgs = screen.getAllByRole('presentation');
    expect(svgs[0]).toHaveAttribute('width', '200'); // background container
    expect(svgs[1]).toHaveAttribute('width', '90'); // medium illustration
  });

  it('uses small variant when available (GenericError)', () => {
    render(
      <ErrorIllustration
        backgroundShape="circle"
        illustrationName="GenericError"
        size="small"
      />,
    );
    const svgs = screen.getAllByRole('presentation');
    expect(svgs[0]).toHaveAttribute('width', '180'); // small container
    expect(svgs[1]).toHaveAttribute('width', '81'); // small illustration width
  });

  it('falls back to medium when small illustration missing (NotFound)', () => {
    render(
      <ErrorIllustration
        backgroundShape="circle"
        illustrationName="NotFound"
        size="small"
      />,
    );
    const svgs = screen.getAllByRole('presentation');
    expect(svgs[0]).toHaveAttribute('width', '180'); // small container still
    expect(svgs[1]).toHaveAttribute('width', '90'); // medium fallback
  });

  it('explicit medium behaves same as default', () => {
    render(
      <ErrorIllustration
        backgroundShape="wavy"
        illustrationName="GenericError"
        size="medium"
      />,
    );
    const svgs = screen.getAllByRole('presentation');
    expect(svgs[0]).toHaveAttribute('width', '200');
    expect(svgs[1]).toHaveAttribute('width', '90');
  });
});
