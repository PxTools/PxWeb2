import React from 'react';
import { render, screen } from '@testing-library/react';

import Link from './Link';

describe('Link', () => {
  const linkText = 'En godt skrevet lenketekst';

  it('renders with children and href', () => {
    render(<Link href="#">{linkText}</Link>);
    const link = screen.getByRole('link', { name: linkText });
    expect(link).toBeTruthy();
    expect(link.getAttribute('href')).toBe('#');
  });

  it('sets empty target attribute when target prop is not provided', () => {
    render(<Link href="#">{linkText}</Link>);
    const link = screen.getByRole('link');
    // target="" is explicitly set in component when no target passed
    expect(link.getAttribute('target')).toBe('');
  });

  it('applies target attribute when provided', () => {
    render(
      <Link href="#" target="_blank">
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('target')).toBe('_blank');
  });

  it('applies size related classes when size="small"', () => {
    render(
      <Link href="#" size="small">
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link.className).toMatch(/bodyshort-small/);
    expect(link.className).toMatch(/padding-small/);
  });

  it('does not apply size related classes when size is omitted', () => {
    render(<Link href="#">{linkText}</Link>);
    const link = screen.getByRole('link');
    expect(link.className).not.toMatch(/bodyshort-(small|medium)/);
    expect(link.className).not.toMatch(/padding-(small|medium)/);
  });

  it('applies inline class when inline prop is true', () => {
    render(
      <Link href="#" inline>
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link.className).toMatch(/inline/);
  });

  it('applies no underline class when noUnderline prop is true', () => {
    render(
      <Link href="#" noUnderline>
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link.className).toMatch(/no_underline/);
  });

  it('renders icon at start when iconPosition="start"', () => {
    render(
      <Link href="#" icon="FileText" iconPosition="start">
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    const html = link.innerHTML;
    expect(html.startsWith('<svg')).toBe(true);
    expect(html).toContain(linkText);
  });

  it('renders icon at end when iconPosition="end"', () => {
    render(
      <Link href="#" icon="FileText" iconPosition="end">
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    const html = link.innerHTML;
    expect(html).toContain(linkText);
    expect(html.startsWith('<svg')).toBe(false);
    expect(html).toMatch(/<svg[\s\S]*><\/svg>$/);
  });

  it('does not render icon when icon prop is not provided', () => {
    render(<Link href="#">{linkText}</Link>);
    const link = screen.getByRole('link');
    expect(link.querySelector('svg')).toBeNull();
  });

  it('forwards ref to underlying anchor element', () => {
    const ref = React.createRef<HTMLAnchorElement>();
    render(
      <Link href="#" ref={ref} data-testid="forward-ref-link">
        {linkText}
      </Link>,
    );
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('A');
  });

  it('passes through arbitrary props (e.g., aria-label)', () => {
    const aria = 'Custom aria label';
    render(
      <Link href="#" aria-label={aria}>
        {linkText}
      </Link>,
    );
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-label')).toBe(aria);
  });
});
