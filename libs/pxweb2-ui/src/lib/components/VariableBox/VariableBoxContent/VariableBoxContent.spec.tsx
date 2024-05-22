import { render } from '@testing-library/react';

import VariableBoxContent from './VariableBoxContent';

describe('VariableBoxContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<VariableBoxContent />);
    expect(baseElement).toBeTruthy();
  });
});
