import { render } from '@testing-library/react';

import VariableBox from './VariableBox';
import { VartypeEnum } from '../../../lib/shared-types/vartypeEnum';

describe('VariableBox', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VariableBox
        id={'test-1'}
        tableId={'test-tableid-1'}
        label={'test-1'}
        mandatory={false}
        languageDirection="ltr"
        values={[{ code: 'test-1', label: 'test-1' }]}
        codeLists={[]}
        onChangeCodeList={() => {
          return;
        }}
        onChangeCheckbox={() => {
          return;
        }}
        onChangeMixedCheckbox={() => {
          return;
        }}
        selectedValues={[]}
        type={VartypeEnum.CONTENTS_VARIABLE}
        addModal={() => {
          return;
        }}
        removeModal={() => {
          return;
        }}
      />,
    );

    expect(baseElement).toBeTruthy();
  });
});
