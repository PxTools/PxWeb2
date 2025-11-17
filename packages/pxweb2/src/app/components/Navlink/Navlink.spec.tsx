import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import '@testing-library/jest-dom/vitest';

import Navlink from './Navlink';

// Mock pxweb2-ui Link and Icon for fallback
vi.mock('@pxweb2/pxweb2-ui', () => ({
  Icon: (props: Record<string, unknown>) => (
    <span data-testid="icon" {...props} />
  ),
  Link: (props: Record<string, unknown>) => (
    <a data-testid="ui-link" {...props} />
  ),
}));

describe('Navlink', () => {
  it('renders as RouterNavLink inside router', () => {
    render(
      <MemoryRouter>
        <Navlink to="/test">Test Link</Navlink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/test');
  });

  it('renders as pxweb2-ui Link outside router', () => {
    render(<Navlink to="/plain">Plain Link</Navlink>);
    const link = screen.getByTestId('ui-link');
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('/plain');
  });

  it('applies className and size', () => {
    render(
      <MemoryRouter>
        <Navlink to="/class" size="medium" className="custom-class">
          Class Link
        </Navlink>
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Class Link' });
    expect(link.className).toMatch(/custom-class/);
    expect(link.className).toMatch(/bodyshort-medium/);
  });

  it('forwards ref to the link', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <MemoryRouter>
        <Navlink to="/ref" ref={ref}>
          Ref Link
        </Navlink>
      </MemoryRouter>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    expect(ref.current?.getAttribute('href')).toBe('/ref');
  });

  it('renders icon if provided', () => {
    render(
      <MemoryRouter>
        <Navlink to="/icon" icon="ExternalLink" iconPosition="start">
          Icon Link
        </Navlink>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
