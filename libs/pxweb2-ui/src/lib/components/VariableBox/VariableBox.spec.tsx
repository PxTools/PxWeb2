import { render } from '@testing-library/react';

import VariableBox from './VariableBox';

describe('VariableBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VariableBox
        id={'test-1'}
        label={'test-1'}
        mandatory={false}
        values={[{ code: 'test-1', label: 'test-1' }]}
        codeLists={[]}
        onChangeCodeList={() => {
          return;
        }}
      />
    );
    expect(baseElement).toBeTruthy();
  });
});
