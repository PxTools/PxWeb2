// Mock react-i18next's useTranslation hook
// needs to be imported before the component
import { mockReactI18next } from '../../../lib/util/testing-utils';
mockReactI18next();

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
