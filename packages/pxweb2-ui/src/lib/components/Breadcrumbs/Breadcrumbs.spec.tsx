import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from './Breadcrumbs';

describe('Breadcrumbs', () => {
  it('renders children as breadcrumb items', () => {
    render(
      <Breadcrumbs>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </Breadcrumbs>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('applies the default style class', () => {
    const { container } = render(
      <Breadcrumbs>
        <a href="/home">Home</a>
      </Breadcrumbs>
    );
    expect(container.firstChild).toHaveClass('breadcrumbs');
  });

  it('applies the compact style class when style="compact"', () => {
    const { container } = render(
      <Breadcrumbs style="compact">
        <a href="/home">Home</a>
      </Breadcrumbs>
    );
    // The compact style class should be present
    expect(container.firstChild).toHaveClass('compact');
  });

  it('renders divider icon between breadcrumb items', () => {
    render(
      <Breadcrumbs>
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </Breadcrumbs>
    );
    // There should be at least one ChevronRight icon
    expect(screen.getAllByTestId('icon-ChevronRight').length).toBeGreaterThan(0);
  });

});
