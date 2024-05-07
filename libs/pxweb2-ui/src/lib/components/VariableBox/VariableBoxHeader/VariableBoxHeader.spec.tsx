import { render } from '@testing-library/react';

import VariableBoxHeader from './VariableBoxHeader';

describe('VariableBoxHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VariableBoxHeader />);
    expect(baseElement).toBeTruthy();
  });
});
