import { render } from '@testing-library/react';

import SideSheet from './SideSheet';
import { mockHTMLDialogElement } from '../../util/test-utils';

describe('SideSheet', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <SideSheet
        isOpen={true}
        heading="test"
        onClose={() => {
          return;
        }}
      >
        <span>test</span>
      </SideSheet>,
    );
    expect(baseElement).toBeTruthy();
  });
});
