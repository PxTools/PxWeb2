import { describe, it, expect } from 'vitest';
import { render, getByText } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ContentBox } from './ContentBox';

describe('ContentBox', () => {
  it('renders children correctly', () => {
    const { container } = render(
      <ContentBox>
        <p>Hello World</p>
      </ContentBox>,
    );

    expect(getByText(container, 'Hello World')).toBeInTheDocument();
  });

  describe('title', () => {
    it('renders when provided', () => {
      const { container } = render(
        <ContentBox title="Test Title">
          <p>Content</p>
        </ContentBox>,
      );

      expect(getByText(container, 'Test Title')).toBeInTheDocument();
    });

    it('does not render when not provided', () => {
      const { container } = render(
        <ContentBox>
          <p>Content without title</p>
        </ContentBox>,
      );

      expect(container.querySelector('h3')).not.toBeInTheDocument();
    });
  });
});
