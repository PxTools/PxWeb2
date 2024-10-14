import { getAllByRole, render } from '@testing-library/react';

import VariableBoxContent from './VariableBoxContent';
import { VartypeEnum } from '../../../shared-types/vartypeEnum';

describe('VariableBoxContent', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        type={VartypeEnum.REGULAR_VARIABLE}
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

  /*
  TODO: Fix this test
  it('should render values in order when the type is not time variable', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        type={VartypeEnum.REGULAR_VARIABLE}
        values={[
          { code: 'test-1', label: 'test-1' },
          { code: 'test-2', label: 'test-2' },
        ]}
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
        totalValues={2}
        totalChosenValues={0}
      />
    );

    const renderedCheckboxes = getAllByRole(baseElement, 'checkbox');

    // Adds the select all checkbox when more than 1 value is present,
    // therefore check [1] and [2] instead of [0] and [1]
    expect(renderedCheckboxes[1].textContent).toBe('Test-1');
    expect(renderedCheckboxes[2].textContent).toBe('Test-2');
  }); */

  /*
  TODO: Fix this test
  it('should render values in reverse order when the type is time variable', () => {
    const { baseElement } = render(
      <VariableBoxContent
        label="test-1"
        type={VartypeEnum.TIME_VARIABLE}
        values={[
          { code: 'test-1', label: 'test-1' },
          { code: 'test-2', label: 'test-2' },
        ]}
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
        totalValues={2}
        totalChosenValues={0}
      />
    );

    const renderedCheckboxes = getAllByRole(baseElement, 'checkbox');

    // Adds the select all checkbox when more than 1 value is present,
    // therefore check [1] and [2] instead of [0] and [1]
    expect(renderedCheckboxes[1].textContent).toBe('Test-2');
    expect(renderedCheckboxes[2].textContent).toBe('Test-1');
  }); */
});
