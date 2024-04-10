import { render } from '@testing-library/react';

import VariableBox from './VariableBox';

describe('VariableBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VariableBox />);
    expect(baseElement).toBeTruthy();
  });
});
