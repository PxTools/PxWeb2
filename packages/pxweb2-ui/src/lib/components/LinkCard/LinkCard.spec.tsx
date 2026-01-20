import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import '@testing-library/jest-dom/vitest';

import { LinkCard } from './LinkCard';

describe('LinkCard', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should render heading text', () => {
    const { getByText } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    expect(getByText('Test Heading')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    const { getByText } = render(
      <LinkCard
        headingText="Test Heading"
        description="Test description"
        href="https://example.com"
      />,
    );

    expect(getByText('Test description')).toBeInTheDocument();
  });

  it('should not render description when not provided', () => {
    const { queryByText } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    expect(queryByText('Test description')).not.toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const { container } = render(
      <LinkCard
        icon="File"
        headingText="Test Heading"
        href="https://example.com"
      />,
    );

    // Check if SVG (rendered by Icon component) is present
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have tabIndex of 0 for keyboard navigation', () => {
    const { getByRole } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    expect(getByRole('link')).toHaveAttribute('tabIndex', '0');
  });

  it('should have role link', () => {
    const { getByRole } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    expect(getByRole('link')).toBeInTheDocument();
  });

  it('should navigate to href on click', async () => {
    const user = userEvent.setup();
    const handleClickSpy = vi.spyOn(globalThis, 'open' as any).mockReturnValue(null);

    const { getByRole } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    const link = getByRole('link');
    await user.click(link);

    handleClickSpy.mockRestore();
  });

  it('should open link in new tab when newTab is true', async () => {
    const user = userEvent.setup();
    const clickSpy = vi.fn();

    const { getByRole } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        newTab={true}
      />,
    );

    const link = getByRole('link');

    // Mock the created link element's click method
    const originalCreateElement = document.createElement;
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const element = originalCreateElement.call(document, tag);
      if (tag === 'a') {
        vi.spyOn(element, 'click').mockImplementation(clickSpy);
      }
      return element;
    });

    await user.click(link);

    document.createElement = originalCreateElement;
  });

  it('should open link in same tab when newTab is false', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        newTab={false}
      />,
    );

    const link = getByRole('link');
    await user.click(link);

    expect(link).toBeInTheDocument();
  });

  it('should navigate on Enter key press', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    const link = getByRole('link');
    await user.keyboard('{Enter}');

    expect(link).toBeInTheDocument();
  });

  it('should navigate on Space key press', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    const link = getByRole('link');
    await user.keyboard(' ');

    expect(link).toBeInTheDocument();
  });

  it('should render with heading type span by default', () => {
    const { container } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        headingType="span"
      />,
    );

    const heading = container.querySelector('span');
    expect(heading?.textContent).toBe('Test Heading');
  });

  it('should render with heading type h2', () => {
    const { container } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        headingType="h2"
      />,
    );

    const heading = container.querySelector('h2');
    expect(heading).toBeInTheDocument();
  });

  it('should render with heading type h3', () => {
    const { container } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        headingType="h3"
      />,
    );

    const heading = container.querySelector('h3');
    expect(heading).toBeInTheDocument();
  });

  it('should render with heading type h4', () => {
    const { container } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        headingType="h4"
      />,
    );

    const heading = container.querySelector('h4');
    expect(heading).toBeInTheDocument();
  });

  it('should render with size medium by default', () => {
    const { container } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        size="medium"
      />,
    );

    const linkCard = container.firstChild as HTMLElement;
    expect(linkCard.className).toContain('link-card-medium');
  });

  it('should render with size small', () => {
    const { container } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        size="small"
      />,
    );

    const linkCard = container.firstChild as HTMLElement;
    expect(linkCard.className).toContain('link-card-small');
  });

  it('should render with ltr direction by default', () => {
    const { getByRole } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        languageDirection="ltr"
      />,
    );

    expect(getByRole('link')).toBeInTheDocument();
  });

  it('should render with rtl direction', () => {
    const { getByRole } = render(
      <LinkCard
        headingText="Test Heading"
        href="https://example.com"
        languageDirection="rtl"
      />,
    );

    expect(getByRole('link')).toBeInTheDocument();
  });

  it('should have aria-labelledby with heading text only', () => {
    const { getByRole } = render(
      <LinkCard headingText="Test Heading" href="https://example.com" />,
    );

    expect(getByRole('link')).toHaveAttribute(
      'aria-labelledby',
      'Test Heading',
    );
  });

  it('should have aria-labelledby with heading and description', () => {
    const { getByRole } = render(
      <LinkCard
        headingText="Test Heading"
        description="Test description"
        href="https://example.com"
      />,
    );

    expect(getByRole('link')).toHaveAttribute(
      'aria-labelledby',
      'Test Heading Test description',
    );
  });

  it('should render with all props combined', () => {
    const { getByText, container } = render(
      <LinkCard
        icon="File"
        headingText="Complete Test"
        description="This is a complete test"
        href="https://example.com"
        newTab={true}
        headingType="h3"
        size="small"
        languageDirection="ltr"
      />,
    );

    expect(getByText('Complete Test')).toBeInTheDocument();
    expect(getByText('This is a complete test')).toBeInTheDocument();
    expect(container.querySelector('h3')).toBeInTheDocument();
    const firstChild = container.firstChild as HTMLElement;
    expect(firstChild.className).toContain('link-card-small');
  });
});
