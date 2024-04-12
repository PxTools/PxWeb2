import { render } from '@testing-library/react';

import Select, { SelectOption } from './Select';

const options: SelectOption[] = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2'}, { label: 'Option 3', value: '3'}];

function selectedOptionChanged(selectedItem: SelectOption) {  
  console.log('Selected option: ' + selectedItem.label);
}

describe('Select', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Select label="Label" options={options} onChange={selectedOptionChanged}/>);
    expect(baseElement).toBeTruthy();
  });
});
