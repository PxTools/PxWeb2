import { render } from '@testing-library/react';

import Expandable from './Expandable';

const content = (
  <div>
    <p>Content</p>
  </div>
);

describe('FilterCategory', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Expandable header="Frekvens" content={content} />,
    );
    expect(baseElement).toBeTruthy();
  });
});
