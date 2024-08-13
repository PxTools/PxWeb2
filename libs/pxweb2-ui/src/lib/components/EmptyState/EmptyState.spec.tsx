import { getByRole, getByText, render } from '@testing-library/react';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <EmptyState
        svgName="ManWithMagnifyingGlass"
        headingTxt="test"
      >
        test
      </EmptyState>
    );

    expect(baseElement).toBeTruthy();
  });

  it('should render the text successfully', () => {
    const { baseElement } = render(
      <EmptyState
        svgName="ManWithMagnifyingGlass"
        headingTxt="heading test text"
      >
        description test text
      </EmptyState>
    );

    expect(getByText(baseElement, 'heading test text')).toBeTruthy();
    expect(getByText(baseElement, 'description test text')).toBeTruthy();
    expect(
      getByRole(baseElement, 'img', { name: 'heading test text. description test text' })
    ).toBeTruthy();
  });

  it('should render the SVG successfully', () => {
    const { baseElement } = render(
      <EmptyState
        svgName="ManWithMagnifyingGlass"
        headingTxt="test"
      >
        test
      </EmptyState>
    );

    expect(getByRole(baseElement, 'img', { name: 'test. test'})).toBeTruthy();
  });
});
