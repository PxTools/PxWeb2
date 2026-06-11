import { render, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import FilterCategory from './FilterCategory';
import classes from './FilterCategory.module.scss';

const content = 'Filter content';

describe('FilterCategory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="Filter screenreader content"
      >
        {content}
      </FilterCategory>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should not display content when openByDefault is false', () => {
    const { getByText } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="Filter screenreader content"
      >
        {content}
      </FilterCategory>,
    );
    const contentElement = getByText('Filter content');
    expect(contentElement).toHaveClass(classes.closed);
  });

  it('should display content when openByDefault is true', () => {
    const { getByText } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="Filter screenreader content"
        openByDefault
      >
        {content}
      </FilterCategory>,
    );
    expect(getByText('Filter content')).toBeVisible();
  });

  it('should show badge with active filters count', () => {
    const { getByRole } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="Filter screenreader content"
        activeFiltersCount={3}
      >
        {content}
      </FilterCategory>,
    );

    const header = getByRole('button', { name: /filter name/i });
    expect(within(header).getByText('3')).toBeVisible();
  });

  it('should keep badge count out of the button accessible name', () => {
    const { getByRole } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="3 active filters"
        activeFiltersCount={3}
      >
        {content}
      </FilterCategory>,
    );

    const header = getByRole('button', { name: 'Filter name' });
    expect(header).toHaveAccessibleName('Filter name');
  });

  it('should update aria-describedby target when activeFiltersCount changes', () => {
    const { getByRole, rerender } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="1 active filter"
        activeFiltersCount={1}
      >
        {content}
      </FilterCategory>,
    );

    const header = getByRole('button', { name: 'Filter name' });
    const initialDescriptionId = header.getAttribute('aria-describedby');

    rerender(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="3 active filters"
        activeFiltersCount={3}
      >
        {content}
      </FilterCategory>,
    );

    const updatedDescriptionId = header.getAttribute('aria-describedby');
    expect(updatedDescriptionId).not.toBe(initialDescriptionId);
    expect(updatedDescriptionId).toContain('-description-id-3');
  });

  it('should not show badge when activeFiltersCount is 0', () => {
    const { getByRole } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="0 active filters"
        activeFiltersCount={0}
      >
        {content}
      </FilterCategory>,
    );

    // Scope to header to ensure we are checking the badge inside the header, not the live region
    const header = getByRole('button', { name: /filter name/i });
    expect(within(header).getByText('0')).not.toBeVisible();
  });

  it('should have correct screen reader text', () => {
    const { getByText } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="1 active filters"
        activeFiltersCount={1}
      >
        {content}
      </FilterCategory>,
    );

    expect(getByText('1 active filters')).toBeVisible();
  });

  it('should not have screen reader text when there are no active filters', () => {
    const { queryByText } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="0 active filters"
        activeFiltersCount={0}
      >
        {content}
      </FilterCategory>,
    );

    expect(queryByText('0 active filters')).not.toBeInTheDocument();
  });

  it('should change aria-expanded attribute when header is clicked', () => {
    const { getByRole } = render(
      <FilterCategory
        header="Filter name"
        screenReaderTxt="Filter screenreader content"
      >
        {content}
      </FilterCategory>,
    );
    const header = getByRole('button', { name: /filter name/i });

    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
