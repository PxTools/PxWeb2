import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import ShowMore from './ShowMore';
import classes from './ShowMore.module.scss';

const content = 'ShowMore content';

describe('ShowMore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <ShowMore header="ShowMore header">{content}</ShowMore>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should not display content when openByDefault is false', () => {
    const { getByText } = render(
      <ShowMore header="ShowMore header">{content}</ShowMore>,
    );
    const contentElement = getByText('ShowMore content');
    expect(contentElement).toHaveClass(classes.closed);
  });

  it('should display content when openByDefault is true', () => {
    const { getByText } = render(
      <ShowMore header="ShowMore header" openByDefault>
        {content}
      </ShowMore>,
    );
    expect(getByText('ShowMore content')).toBeVisible();
  });

  it('should change aria-expanded attribute when header is clicked', () => {
    const { getByRole } = render(
      <ShowMore header="ShowMore header">{content}</ShowMore>,
    );
    const header = getByRole('button', { name: /ShowMore header/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
