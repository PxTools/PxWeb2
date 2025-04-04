import { render } from '@testing-library/react';

import FilterCategory from './FilterCategory';

const content = (
  <div>
    <p>Content</p>
  </div>
);

describe('FilterCategory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <FilterCategory header="Filter name">{content}</FilterCategory>,
    );
    expect(baseElement).toBeTruthy();
  });
});
