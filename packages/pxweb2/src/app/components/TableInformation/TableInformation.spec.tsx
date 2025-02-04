import { render } from '@testing-library/react';

import TableInformation from './TableInformation';
import { mockHTMLDialogElement } from '@pxweb2/pxweb2-ui/src/lib/util/test-utils';

describe('TableInformation', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = render(
      <TableInformation
        isOpen={true}
        onClose={() => {
          return;
        }}
      />,
    );
    expect(baseElement).toBeTruthy();
  });
});
