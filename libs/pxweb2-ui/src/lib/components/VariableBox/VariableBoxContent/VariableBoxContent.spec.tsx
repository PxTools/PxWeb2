import { render } from '@testing-library/react';

import VariableBoxContent from './VariableBoxContent';

describe('VariableBoxContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        values={[{ code: 'test-1', label: 'test-1' }]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        varId="test-1"
        selectedValues={[]}
        totalValues={1}
        totalChosenValues={0}
      />
    );
    
    expect(baseElement).toBeTruthy();
  });
});
