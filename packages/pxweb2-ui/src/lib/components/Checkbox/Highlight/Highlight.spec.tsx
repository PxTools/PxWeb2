import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { Highlight } from './Highlight';
import styles from './Highlight.module.scss';

describe('Highlight component', () => {
  it('renders the text without highlighting when searchTerm is not provided', () => {
    const text = 'Sample text without highlights';
    const { container } = render(<Highlight text={text} />);

    expect(
      container.querySelector(`.${styles.highlight}`),
    ).not.toBeInTheDocument();
    expect(container.textContent).toBe(text);
  });

  it('renders the text without highlighting when searchTerm is empty', () => {
    const text = 'Sample text without highlights';
    const { container } = render(<Highlight text={text} searchTerm="" />);

    expect(
      container.querySelector(`.${styles.highlight}`),
    ).not.toBeInTheDocument();
    expect(container.textContent).toBe(text);
  });

  it('highlights the matching portion of text', () => {
    const text = 'This is sample text';
    const searchTerm = 'sample';
    const { container } = render(
      <Highlight text={text} searchTerm={searchTerm} />,
    );

    const highlightedElement = container.querySelector(`.${styles.highlight}`);

    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement?.textContent).toBe('sample');
    expect(container.textContent).toBe(text);
  });

  it('highlights multiple occurrences of the searchTerm', () => {
    const text = 'This test is a test for multiple matches';
    const searchTerm = 'test';
    const { container } = render(
      <Highlight text={text} searchTerm={searchTerm} />,
    );

    const highlightedElements = container.querySelectorAll(
      `.${styles.highlight}`,
    );

    expect(highlightedElements.length).toBe(2);
    expect(highlightedElements[0].textContent).toBe('test');
    expect(highlightedElements[1].textContent).toBe('test');
    expect(container.textContent).toBe(text);
  });

  it('performs case-insensitive highlighting', () => {
    const text = 'This Test is different from test';
    const searchTerm = 'test';
    const { container } = render(
      <Highlight text={text} searchTerm={searchTerm} />,
    );

    const highlightedElements = container.querySelectorAll(
      `.${styles.highlight}`,
    );

    expect(highlightedElements.length).toBe(2);
    expect(highlightedElements[0].textContent).toBe('Test');
    expect(highlightedElements[1].textContent).toBe('test');
  });

  it('renders text normally when searchTerm does not match any part of the text', () => {
    const text = 'This is sample text';
    const searchTerm = 'nonexistent';
    const { container } = render(
      <Highlight text={text} searchTerm={searchTerm} />,
    );

    expect(
      container.querySelector(`.${styles.highlight}`),
    ).not.toBeInTheDocument();
    expect(container.textContent).toBe(text);
  });

  it('correctly preserves the structure when the searchTerm is at the beginning or end', () => {
    const text = 'Start middle end';
    const searchTerm = 'start';
    const { container } = render(
      <Highlight text={text} searchTerm={searchTerm} />,
    );

    const highlightedElement = container.querySelector(`.${styles.highlight}`);

    expect(highlightedElement).toBeInTheDocument();
    expect(highlightedElement?.textContent).toBe('Start');
    expect(container.textContent).toBe(text);
  });
});
