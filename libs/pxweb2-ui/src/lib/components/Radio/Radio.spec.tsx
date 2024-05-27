import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import Radio, { SelectOption } from '../Radio';

describe('Radio', () => {
    const options: SelectOption[] = [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' },
        { label: 'Option 3', value: 'option3' },
    ];

    it('renders radio options correctly', () => {
        const { getByLabelText } = render(
            <Radio name="test" options={options} onChange={jest.fn()} />
        );

        options.forEach((option) => {
            const radioOption = getByLabelText(option.label);
            expect(radioOption).toBeInTheDocument();
            expect(radioOption).toHaveAttribute('type', 'radio');
            expect(radioOption).toHaveAttribute('name', 'test');
            expect(radioOption).toHaveAttribute('value', option.value);
        });
    });

    it('calls onChange when a radio option is selected', () => {
        const onChange = jest.fn();
        const { getByLabelText } = render(
            <Radio name="test" options={options} onChange={onChange} />
        );

        const radioOption = getByLabelText('Option 1');
        fireEvent.click(radioOption);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(expect.any(Object));
    });
});