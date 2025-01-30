import { render } from '@testing-library/react';

import VariableBoxHeader from './VariableBoxHeader';

describe('VariableBoxHeader', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VariableBoxHeader
        label="test-1"
        mandatory={false}
        totalValues={1}
        totalChosenValues={0}
        isOpen={false}
        setIsOpen={() => {
          return;
        }}
      />,
    );

    expect(baseElement).toBeTruthy();
  });
});
