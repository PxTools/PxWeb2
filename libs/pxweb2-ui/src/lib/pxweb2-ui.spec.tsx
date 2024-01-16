import { render } from '@testing-library/react';

import Pxweb2Ui from './pxweb2-ui';

describe('Pxweb2Ui', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Pxweb2Ui />);
    expect(baseElement).toBeTruthy();
  });
});
