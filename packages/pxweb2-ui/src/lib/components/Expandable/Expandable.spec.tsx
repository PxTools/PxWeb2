import { render } from '@testing-library/react';

import Expandable from './Expandable';

const content = (
  <div>
    <p>Content</p>
  </div>
);

describe('Expandable', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <Expandable header="Filter name">{content}</Expandable>,
    );
    expect(baseElement).toBeTruthy();
  });
});
