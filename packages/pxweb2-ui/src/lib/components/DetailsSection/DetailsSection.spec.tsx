import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

import DetailsSection from './DetailsSection';
import classes from './DetailsSection.module.scss';

const content = 'DetailsSection content';

describe('DetailsSection', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <DetailsSection header="DetailsSection header">{content}</DetailsSection>,
    );
    expect(baseElement).toBeTruthy();
  });

  it('should not display content when openByDefault is false', () => {
    const { getByText } = render(
      <DetailsSection header="DetailsSection header">{content}</DetailsSection>,
    );
    const contentElement = getByText('DetailsSection content');
    expect(contentElement).toHaveClass(classes.closed);
  });

  it('should display content when openByDefault is true', () => {
    const { getByText } = render(
      <DetailsSection header="DetailsSection header" openByDefault>
        {content}
      </DetailsSection>,
    );
    expect(getByText('DetailsSection content')).toBeVisible();
  });

  it('should change aria-expanded attribute when header is clicked', () => {
    const { getByRole } = render(
      <DetailsSection header="DetailsSection header">{content}</DetailsSection>,
    );
    const header = getByRole('button', { name: /DetailsSection header/i });
    expect(header).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'true');
  });
});
