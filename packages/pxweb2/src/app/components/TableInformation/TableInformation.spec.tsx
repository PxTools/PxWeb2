import TableInformation from './TableInformation';
import { mockHTMLDialogElement } from '@pxweb2/pxweb2-ui/src/lib/util/test-utils';
import { renderWithProviders } from '../../util/testing-utils';

describe('TableInformation', () => {
  beforeEach(() => {
    mockHTMLDialogElement();
  });

  it('should render successfully', () => {
    const { baseElement } = renderWithProviders(
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
