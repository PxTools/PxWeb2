import { render } from '@testing-library/react';

import Radio from './Radio';

const  options = [{ label: 'Option 1', value: '1' }, { label: 'Option 2', value: '2'}, { label: 'Option 3', value: '3'}];

describe('Radio', () => {
    it('should render successfully', () => {
        const { baseElement } = render(<Radio options={options} name='Radio1'  />);
        expect(baseElement).toBeTruthy();
      });
    });

