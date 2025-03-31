import { render } from '@testing-library/react';

import { mockHTMLDialogElement } from '../../util/test-utils';
import { InformationCard } from './InformationCard';
describe('SideSheet', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <InformationCard headingText="test" icon="Book">
        <span>test</span>
      </InformationCard>,
    );
    expect(baseElement).toBeTruthy();
  });
});
