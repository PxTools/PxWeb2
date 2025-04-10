import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import FilterCategory from './FilterCategory';
import classes from './FilterCategory.module.scss';

const content = 'Filter content';

describe('FilterCategory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FilterCategory header="Filter name">{content}</FilterCategory>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should not display content when openByDefault is false', () => {
    const { getByText } = render(
      <FilterCategory header="Filter name">{content}</FilterCategory>,
    );
    const contentElement = getByText('Filter content');
    expect(contentElement).toHaveClass(classes.closed);
  });

  it('should display content when openByDefault is true', () => {
    const { getByText } = render(
      <FilterCategory header="Filter name" openByDefault>
        {content}
      </FilterCategory>,
    );
    expect(getByText('Filter content')).toBeVisible();
  });

  it('should change aria-expanded attribute when header is clicked', () => {
    const { getByRole } = render(
      <FilterCategory header="Filter name">{content}</FilterCategory>,
    );
    const header = getByRole('button', { name: /filter name/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
