import { getByText, render } from '@testing-library/react';

import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <EmptyState
        svgName="ManWithMagnifyingGlass"
        headingTxt="test"
        descriptionTxt="test"
      />,
    );

    expect(baseElement).toBeTruthy();
  });

  it('should render the text successfully', () => {
    const { baseElement } = render(
      <EmptyState
        svgName="ManWithMagnifyingGlass"
        headingTxt="heading test text"
        descriptionTxt="description test text"
      />,
    );

    expect(getByText(baseElement, 'heading test text')).toBeTruthy();
    expect(getByText(baseElement, 'description test text')).toBeTruthy();
  });

  it('should render an SVG', () => {
    const { baseElement } = render(
      <EmptyState
        svgName="ManWithMagnifyingGlass"
        headingTxt="test"
        descriptionTxt="test"
      />,
    );

    const svg = baseElement.querySelector('svg');

    expect(svg).toBeTruthy();
  });
});
